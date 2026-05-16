Base SQLite (sql.js) miroir de 7 CSV. Montants en CHF. Dates en TEXT ISO `YYYY-MM-DD` (triables lexicographiquement). Booléens en INTEGER 0/1 (ex. `WHERE actif = 1`).

## Tables

- **clients** (50) — PK `id` (`CLT###`). Colonnes : `raison_sociale`, `ville`, `secteur`, `segment`, `courtier_id`, `actif`, `nb_employes`, `chiffre_affaires_annuel`, `date_entree`.
- **compagnies** (10) — PK `id` (`CMP###`). Colonnes : `nom` (AXA, Zurich, Helvetia, Allianz, Generali, Vaudoise…), `commission_base`.
- **contrats** (189) — PK `id` (`POL####`). FK `client_id`, `courtier_id`, `compagnie_id`. Colonnes : `compagnie_nom`, `branche`, `statut`, `date_debut`, `date_echeance`, `periodicite`, `prime_annuelle`, `commission_taux`, `commission_annuelle`, `source`.
- **primes** (2 518) — PK `id` (`PRM#####`). FK `contrat_id`, `client_id`. Colonnes : `date_emission`, `date_echeance`, `date_encaissement` (nullable), `montant_brut`, `montant_net`, `statut`. **Volumineuse : toujours filtrer ou agréger.**
- **sinistres** (45) — PK `id` (`SIN###`). FK `contrat_id`, `client_id`, `courtier_id`. Colonnes : `branche`, `statut`, `date_survenance`, `date_declaration`, `date_cloture` (nullable), `montant_estime`, `montant_indemnise`, `nature`, `gestionnaire_id`.
- **renouvellements** (19) — PK `id` (`REN###`). FK `contrat_id`, `client_id`, `courtier_id`. Colonnes : `branche`, `statut`, `date_echeance`, `jours_restants`, `prime_actuelle`, `motif_resiliation` (nullable).
- **prospects** (30) — PK `id` (`PROS###`). FK `courtier_id`. Colonnes : `raison_sociale`, `ville`, `secteur`, `statut`, `potentiel_prime_annuelle`, `date_premier_contact`, `date_relance` (nullable), `motif_perte` (nullable), `source`, `nb_employes`.

## Enums

- `branche` (`contrats`, `sinistres`, `renouvellements`) : `RC_pro | accident | cyber | incendie | maladie | protection_juridique | transport | vehicule | vie`.
- `clients.segment` : `bronze | silver | gold`.
- `contrats.statut` : `actif | résilié | suspendu`.
- `contrats.periodicite` : `annuel | semestriel | trimestriel`.
- `primes.statut` : `encaissée | annulée`.
- `sinistres.statut` : `ouvert | en_cours | clôturé | refusé`.
- `renouvellements.statut` : `à_traiter | en_cours | en_attente_client | renouvelé`.
- `prospects.statut` : `nouveau | contacté | rendez_vous | offre_envoyée | gagné | perdu`.

## Jointures

`contrats.client_id → clients.id` · `contrats.compagnie_id → compagnies.id` · `primes.contrat_id → contrats.id` · `sinistres.contrat_id → contrats.id` · `renouvellements.contrat_id → contrats.id`. Tous portent un `courtier_id` (`C001`…`C005`).

## Métriques courantes

- **CA primes** : `SUM(prime_annuelle) WHERE statut = 'actif'`.
- **Ratio sinistralité** : `SUM(sinistres.montant_indemnise) / SUM(contrats.prime_annuelle)`, par branche ou globalement.
- **Taux conversion prospects** : `gagné / (gagné + perdu)`.
- **Taux rétention** : `1 - résiliés / total contrats`.

## Patterns SQL utiles

Modèles à réutiliser pour `query_database` — adapte les colonnes/filtres, conserve la structure.

- **Top-N clients par CA primes encaissées sur une année** (filtre par année avec `LIKE` plutôt que `strftime`) :
  ```sql
  SELECT c.id, c.raison_sociale, SUM(p.montant_net) AS ca_chf
  FROM clients c JOIN primes p ON p.client_id = c.id
  WHERE p.statut = 'encaissée' AND p.date_emission LIKE '2025-%'
  GROUP BY c.id, c.raison_sociale
  ORDER BY ca_chf DESC LIMIT 5
  ```

- **Comparer compagnies par CA actif et exposition sinistres** :
  ```sql
  SELECT c.compagnie_nom,
         SUM(c.prime_annuelle) AS ca_chf,
         COALESCE(SUM(s.montant_indemnise), 0) AS sinistres_chf
  FROM contrats c LEFT JOIN sinistres s ON s.contrat_id = c.id
  WHERE c.statut = 'actif'
  GROUP BY c.compagnie_nom ORDER BY ca_chf DESC
  ```

- **Filtre par année** : préfère `WHERE date_xxx LIKE 'AAAA-%'` à `strftime('%Y', date_xxx) = 'AAAA'` — tri lexicographique du TEXT ISO, plus rapide.
