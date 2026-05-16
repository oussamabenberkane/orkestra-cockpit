// Renders the `# Mémoire utilisateur` section appended to the system prompt.
//
// Appended at the very end (after the stable rules + schema + few-shot
// prefix) so the prompt's KV-cacheable prefix stays byte-identical across
// turns — only the volatile memory block changes.

import type { Memory, MemoryKind } from "./types";

const KIND_LABEL: Record<MemoryKind, string> = {
  preference: "Préférences",
  watch: "Entités suivies",
  "saved-view": "Vues sauvegardées",
  note: "Notes",
};

// `saved-view` is a UI-only construct (one-click replay); it is NOT injected
// into the system prompt — that would just bloat context with raw questions
// the agent doesn't need to know about in advance.
const KINDS_TO_INJECT: readonly MemoryKind[] = ["preference", "watch", "note"];

// Caps applied at injection time. Memories are user-authored free text and
// land directly inside the system prompt; once the store moves server-side
// (post-migration) we must assume anything in `name`/`body`/`target` is
// potentially adversarial and bound both its size and its shape so it can't
// bloat the prompt or break out of the bullet formatting.
const MAX_ITEMS_INJECTED = 30;
const MAX_NAME_LEN = 80;
const MAX_BODY_LEN = 500;
const MAX_TARGET_LEN = 80;

// Built once. Strips ASCII C0 controls + DEL + the common zero-width chars
// (ZWSP/ZWNJ/ZWJ/BOM) often used to smuggle hidden payload into prompt text.
// Built from a string so the \u escapes survive any source-level transform.
const STRIP_RE = new RegExp(
  "[" +
    "\\u0000-\\u001F" + // C0 controls (incl. \r \n \t)
    "\\u007F" + //        DEL
    "\\u200B-\\u200D" + // zero-width space / non-joiner / joiner
    "\\uFEFF" + //        zero-width no-break space (BOM)
    "]",
  "g",
);

function sanitiseText(input: string, maxLen: number): string {
  // Strip control / zero-width chars first, then collapse any remaining
  // whitespace run to a single space — each memory renders on one bullet
  // line, so embedded newlines would create stray lines that read like
  // standalone instructions to the model.
  const cleaned = input.replace(STRIP_RE, " ").replace(/\s+/g, " ").trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen - 1) + "…" : cleaned;
}

/**
 * Returns a section ready to be appended to the system prompt, or "" when
 * nothing relevant to inject. Each item is rendered as a compact bullet
 * ("**name** — body"); `watch` items also surface their target id.
 */
export function renderMemoriesBlock(memories: Memory[] | undefined): string {
  if (!memories || memories.length === 0) return "";

  // Filter by kind first, then cap — `saved-view` items don't count against
  // the injection budget since they're never injected anyway.
  const injectable = memories
    .filter((m) => KINDS_TO_INJECT.includes(m.kind))
    .slice(0, MAX_ITEMS_INJECTED);
  if (injectable.length === 0) return "";

  const grouped = new Map<MemoryKind, Memory[]>();
  for (const m of injectable) {
    const arr = grouped.get(m.kind) ?? [];
    arr.push(m);
    grouped.set(m.kind, arr);
  }

  const sections: string[] = [];
  for (const kind of KINDS_TO_INJECT) {
    const arr = grouped.get(kind);
    if (!arr || arr.length === 0) continue;
    const items: string[] = [];
    for (const m of arr) {
      const safeName = sanitiseText(m.name, MAX_NAME_LEN);
      const safeBody = sanitiseText(m.body, MAX_BODY_LEN);
      if (!safeName || !safeBody) continue;
      const safeTarget = m.target ? sanitiseText(m.target, MAX_TARGET_LEN) : undefined;
      const target = m.kind === "watch" && safeTarget ? ` (\`${safeTarget}\`)` : "";
      items.push(`- **${safeName}**${target} — ${safeBody}`);
    }
    if (items.length === 0) continue;
    sections.push(`## ${KIND_LABEL[kind]}\n${items.join("\n")}`);
  }
  if (sections.length === 0) return "";

  return [
    "",
    "---",
    "",
    "# Mémoire utilisateur",
    "",
    "L'utilisateur t'a explicitement demandé de retenir les éléments ci-dessous. Tu peux t'en servir silencieusement pour adapter tes réponses ; ne les cite jamais comme source.",
    "",
    sections.join("\n\n"),
  ].join("\n");
}
