// SQL escape-hatch tool — primary tool for any compositional question
// (rankings, cross-table aggregates, top-N, comparisons, multi-filter
// listings).
//
// Errors are returned as data rather than thrown, so the model sees the
// error message and self-corrects on the next step.

import { tool } from "ai";
import { z } from "zod";
import { getDatabaseAdapter } from "../data/db";

export const queryDatabase = tool({
  description: `Exécute une requête SQL en lecture seule (SELECT ou WITH) sur la base de données du cabinet.

À utiliser pour toute question dont la réponse exige un classement complet, un agrégat croisé, une jointure ou un calcul (par ex. « ratio de sinistralité par branche classé du plus élevé au plus bas », « top 10 clients en CA », « comparaison AXA vs Zurich par sinistralité »).

Pour les KPIs globaux pré-calculés, utilise plutôt \`get_dashboard_kpis\` / \`get_revenue_summary\` / \`get_sinistralite_ratio\` / \`get_pipeline_summary\`.

Schéma : 7 tables (clients, compagnies, contrats, primes, sinistres, renouvellements, prospects). Voir le document de schéma en début de prompt pour les colonnes et les jointures.

Règles :
- SELECT ou WITH uniquement, une seule instruction par appel (pas de \`;\` interne).
- Maximum 1000 lignes retournées. Si \`truncated: true\`, restreins la requête (\`LIMIT\`, filtres, agrégats).
- Les dates sont stockées au format ISO \`YYYY-MM-DD\` (TEXT, triable lexicographiquement).
- Les booléens sont stockés en INTEGER (0/1) — ex. \`WHERE actif = 1\`.
- En cas d'erreur SQL, le message d'erreur t'est renvoyé : corrige la requête et réessaie.

Exemple : \`SELECT branche, ROUND(SUM(s.montant_indemnise) * 1.0 / NULLIF(SUM(c.prime_annuelle), 0), 3) AS ratio FROM contrats c LEFT JOIN sinistres s ON s.contrat_id = c.id WHERE c.statut = 'actif' GROUP BY branche ORDER BY ratio DESC\``,
  parameters: z.object({
    sql: z
      .string()
      .min(7)
      .describe("Requête SQL SELECT ou WITH, une seule instruction, sans `;` final."),
  }),
  execute: async ({ sql }) => {
    try {
      const adapter = getDatabaseAdapter();
      // Per-call budget. The sql.js adapter ignores the timeout (in-memory)
      // but the future Postgres adapter must honour both — passing them here
      // ties the tool's intent to the adapter contract.
      return await adapter.query(sql, {
        maxRows: 1000,
        statementTimeoutMs: 5000,
      });
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
        sql,
      };
    }
  },
});
