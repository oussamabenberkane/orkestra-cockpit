# `src/agent` — Orkestra Cockpit AI agent

Self-contained module. The dashboard UI does not import from here, and this
module does not import from the dashboard. The chat UI (whenever the design
team builds it) talks to the agent only via the HTTP endpoint
[`/api/agent`](../app/api/agent/route.ts).

## Folder map

```
src/agent/
├── context/
│   ├── schema.md            ← data dictionary embedded in the system prompt
│   └── system-prompt.ts     ← persona + schema.md injection + today's date
├── data/
│   ├── types.ts             ← TS types per CSV/table
│   └── loader.ts            ← reads data/*.csv with papaparse, caches in memory
├── tools/
│   └── index.ts             ← typed tool definitions (AI SDK + zod)
└── runtime.ts               ← Gemini wiring, streaming + one-shot helpers
```

## Provider swap

`runtime.ts` builds the model via `@ai-sdk/google`. To switch providers:

```ts
// pnpm add @ai-sdk/anthropic
import { createAnthropic } from "@ai-sdk/anthropic";
// ...
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
return anthropic("claude-haiku-4-5");
```

The tools, the schema doc, the system prompt, and the API route do not change.

## Postgres migration

Today, `loadDataset()` reads CSVs and caches them in memory. When we move to
Postgres, replace the *body* of `loadDataset()` with `SELECT *` queries (or
return a `Dataset`-shaped object backed by a query layer). Every tool above
keeps working unchanged — they operate on plain arrays.

If we expect heavy queries (e.g. millions of `primes` rows), refactor tool
bodies to issue per-question SQL instead of pulling whole tables.

## Limits / caps

- `LIMIT_DEFAULT = 50`, `LIMIT_MAX = 200` per list call.
- `maxSteps = 8` per agent turn (caps tool-call recursion).
- `list_primes` rejects no-filter calls — that table is 2 500+ rows.
- `temperature = 0.2` — numbers should be deterministic.
