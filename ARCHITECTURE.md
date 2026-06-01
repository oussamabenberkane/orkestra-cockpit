# Architecture — Orkestra Cockpit

> Document de référence technique destiné à être adapté en support PPT.
> Public visé : revue technique interne / présentation client.
> État au 31 mai 2026.

## Stack actuel

Le cockpit Helvebroker SA est aujourd'hui une application web mono-tenant, conçue comme démonstrateur. La pile en production sur Infomaniak (hébergement suisse) est la suivante :

- **Front + back unifiés** : Next.js 16.2 (App Router) sur React 19, TypeScript strict. Le rendu est partagé entre Server Components (composition, routage) et Client Components (état dashboard, modales, palette de commandes).
- **Design system** : Tailwind CSS v4 piloté par tokens (`@theme inline` dans `globals.css`), composants shadcn/ui posés sur les primitives `@base-ui/react`. Aucune dépendance à Radix.
- **Couche IA** : Vercel AI SDK v4 avec `@ai-sdk/mistral` (`mistral-large-latest`, température 0.2). Le runtime est isolé dans `src/agent/`, exposé uniquement via `/api/agent`. Les outils typés (zod) donnent à l'agent un accès en lecture aux jeux de données métier.
- **Données de démo** : sept fichiers CSV (`data/*.csv`) parsés par `papaparse` et mis en cache mémoire au démarrage du process (`src/agent/data/loader.ts`). `sql.js` est câblé mais non utilisé — il sera remplacé par PostgreSQL à la prochaine itération.
- **Workspaces** : un scaffolding `src/lib/workspaces/` permet déjà de basculer entre deux verticales métier (broker / commodity). C'est une bascule **sectorielle**, pas multi-cabinets — voir plus bas.

Aucune dépendance d'orchestration, d'entrepôt, ni de MLOps n'est en place aujourd'hui : la démo n'en a pas besoin.

## Mise à l'échelle — du démonstrateur à la plateforme

Le passage en production multi-cabinets impose de remplacer chaque raccourci de la démo par une brique outillée. Le tableau ci-dessous récapitule les transitions « aujourd'hui → demain » :

| Couche | Aujourd'hui (démo) | Demain (production) |
|---|---|---|
| Ingestion | CSV statiques copiés dans `data/` | **Airbyte** (ou Fivetran) — connecteurs vers les CRM/AS400 des cabinets |
| Stockage transactionnel | Cache mémoire papaparse | **PostgreSQL** managé (Infomaniak ou Scaleway) |
| Entrepôt analytique | — | **DuckDB** en local → **BigQuery** / **Snowflake** au-delà de quelques To |
| Transformations | Mapping TS ad hoc dans `loader.ts` | **dbt** (modèles versionnés, tests de qualité, lineage) |
| Orchestration | — | **Dagster** ou **Prefect** (jobs ELT, recalculs KPI, alertes) |
| Event store / audit | `console.info` du runtime agent | Journal d'événements append-only (Postgres + topic Kafka/Redpanda si volume) |
| MLOps | Mistral en direct via SDK | Registre de modèles + harnais d'évaluation + feature store léger ; routage multi-modèles (Mistral + fallback) avec cache et observabilité (Langfuse) |
| Identité | Mock côté client | OIDC (Authentik, Auth.js) + SCIM pour le provisionnement |
| Déploiement | Build Next.js mono-instance | Conteneurisé, derrière un load balancer, autoscalé |

Le code applicatif est déjà structuré pour absorber la majorité de ces évolutions sans réécriture : la frontière agent ↔ UI (`/api/agent`) est strictement respectée, le `loadDataset()` est le seul point à brancher sur PostgreSQL, et les tuiles dashboard lisent depuis `dashboard-mock.ts` (interfaces typées prêtes à recevoir un fetcher distant).

## Architecture multi-cabinets

Le cockpit est aujourd'hui mono-tenant : tout le contenu vise Helvebroker SA. L'arrivée d'un second cabinet impose un modèle d'isolation explicite, articulé sur cinq axes.

### 1. Séparation des données sensibles — la décision structurante

**Notre PostgreSQL ne stockera que des identifiants et des métadonnées non sensibles.** Les données nominatives des assurés (noms, adresses, IBAN, numéros AVS, données de santé, pièces jointes) **restent chez le cabinet**, dans la base ou le CRM qu'il opère déjà.

Concrètement, la base que nous hébergeons contient :

- les **identifiants** (`client_id`, `contrat_id`, `sinistre_id`) — clés étrangères vers le système du cabinet ;
- les **métadonnées opérationnelles non sensibles** : statuts, dates, montants agrégés, branches, échéances, KPI calculés ;
- les artefacts du cockpit : configuration tenant, mémoire de l'agent, journaux d'audit, attribution d'usage.

Lorsqu'un écran ou l'agent a besoin de résoudre un identifiant en information lisible (« afficher le nom du client `c_482` »), la requête est faite **en direct sur le système du cabinet**, via une API dédiée ou un connecteur ELT lisant par `client_id`. La donnée nominative ne transite que pour l'affichage demandé, n'est jamais persistée chez nous, et reste sous la juridiction du cabinet (LPD suisse, nGDPR).

```
┌──────────────────────────────────────────┐
│ Infrastructure Orkestra                  │
│                                          │
│   ┌──────────────────┐   ┌────────────┐  │
│   │ PostgreSQL       │   │ Runtime    │  │
│   │ IDs + métriques  │◄──┤ agent      │  │
│   │ + config tenant  │   │ (Mistral)  │  │
│   │ + audit          │   └─────┬──────┘  │
│   └──────────────────┘         │         │
└────────────────────────────────┼─────────┘
                                 │  résolution par ID
                                 ▼  (HTTPS, mTLS)
┌──────────────────────────────────────────┐
│ Infrastructure du cabinet                │
│   ┌──────────────────────────────┐       │
│   │ Base PII / CRM existant      │       │
│   │ (noms, IBAN, AVS, santé…)    │       │
│   └──────────────────────────────┘       │
└──────────────────────────────────────────┘
```

Ce modèle a trois conséquences directes : (a) en cas de compromission de notre infrastructure, aucune donnée nominative n'est exposée ; (b) un cabinet peut révoquer l'accès en coupant la connexion à sa base, sans migration côté Orkestra ; (c) la conformité LPD/nGDPR est largement simplifiée puisque nous ne sommes pas sous-traitant de données personnelles sensibles au sens strict.

### 2. Identité et frontière d'authentification

OIDC fédéré par tenant. Chaque cabinet dispose de son propre realm (groupes, rôles, MFA configurés selon sa politique). Le `tenant_id` est extrait du token à chaque requête et propagé en bas du middleware Next.js ; toute requête SQL et tout appel agent est scopé par ce `tenant_id`. Aucun lookup ne peut traverser la frontière tenant.

### 3. Configuration par cabinet

Le scaffolding `src/lib/workspaces/` (aujourd'hui sectoriel) est étendu pour porter aussi la configuration par cabinet : branding, seuils d'alerte, taxonomie des branches, mappings vers le CRM source, modèle de commission. Servie côté serveur en début de session, mise en cache courte durée.

### 4. Isolation de la mémoire agent

Les souvenirs de l'agent (`src/agent/memory/`) sont aujourd'hui locaux au navigateur. En production, ils sont persistés en base avec une clé composite `(tenant_id, user_id)`. Le prompt système n'injecte que les mémoires du tenant actif ; il n'existe aucun chemin par lequel l'agent du cabinet B pourrait voir le contexte du cabinet A.

### 5. Facturation et attribution d'usage

Chaque appel à `/api/agent` enregistre `tenant_id`, `user_id`, modèle, nombre de tokens entrants/sortants, nombre d'étapes d'outils. Agrégé quotidiennement, ce journal sert à la facturation à l'usage et à la détection d'anomalies (boucles, abus, dérive de coût).

---

*Ce document décrit l'état réel du code au 31 mai 2026 et la trajectoire envisagée. Il ne préempte aucune décision d'achat ni de fournisseur — les noms cités (Airbyte, dbt, Dagster, BigQuery, Snowflake, Langfuse) sont des références sectorielles, à arbitrer selon le volume réel et les contraintes d'hébergement suisses.*
