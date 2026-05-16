// `save_memory` tool — the agent's path for persisting a user-scoped memory
// when the user says things like "retiens que…", "souviens-toi de…",
// "garde en tête que…".
//
// Server-side execution is intentionally stateless: it validates the input
// and echoes back a `MemoryProposal` payload. The chat client picks the
// proposal up from the tool-result trailer and persists it locally via the
// `MemoryStore`. This keeps the server free of any user-scoped storage
// (matching how conversations are persisted today) so the eventual swap to
// a server-backed `MemoryStore` only changes the page's wiring, not this
// tool.

import { tool } from "ai";
import { z } from "zod";

const memoryKind = z.enum(["preference", "watch", "saved-view", "note"]);

export const saveMemory = tool({
  description: `Enregistre une information que l'utilisateur t'a explicitement demandé de retenir pour les prochaines conversations. À utiliser quand l'utilisateur dit clairement « retiens que… », « souviens-toi de… », « garde en tête que… » ou équivalent.

Ne pas utiliser pour :
- des données métier (chiffres, listes) — ce sont des résultats à recalculer, pas des préférences.
- des choses que tu inventes — uniquement ce que l'utilisateur a explicitement demandé.

Genres (\`kind\`) :
- \`preference\` : préférence de format, de tri, de tonalité (ex. « toujours afficher Vaudoise en premier »).
- \`watch\` : entité à suivre (\`CLT###\`, \`POL####\`, \`SIN###\`) — renseigne aussi \`target\` avec l'identifiant.
- \`saved-view\` : question récurrente à rejouer plus tard (le \`body\` contient la question en français).
- \`note\` : tout le reste (correction d'une réponse précédente, contexte sur le rôle de l'utilisateur, etc.).

Le \`name\` est un libellé court (≤ 5 mots), le \`body\` la formulation complète (≤ 30 mots).

Après l'appel, confirme en une phrase à l'utilisateur, sans répéter le contenu mécaniquement.`,
  parameters: z.object({
    kind: memoryKind.describe(
      "Genre de souvenir : preference, watch, saved-view, ou note.",
    ),
    name: z
      .string()
      .min(1)
      .max(60)
      .describe("Libellé court (≤ 5 mots) qui identifie le souvenir."),
    body: z
      .string()
      .min(1)
      .max(280)
      .describe("Formulation complète (≤ 30 mots conseillé)."),
    target: z
      .string()
      .optional()
      .describe(
        "Pour kind=watch uniquement : l'identifiant suivi (`CLT###`, `POL####`, `SIN###`, etc.).",
      ),
  }),
  // The result shape is what the client looks for in the trailer to apply
  // locally. Keep the field name `memory_proposal` stable — the chat page
  // pattern-matches on it.
  execute: async ({ kind, name, body, target }) => {
    return {
      ok: true,
      memory_proposal: {
        kind,
        name: name.trim(),
        body: body.trim(),
        ...(target ? { target: target.trim() } : {}),
      },
    };
  },
});
