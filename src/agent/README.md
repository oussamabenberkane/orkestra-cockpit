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
│   ├── types.ts             ← TS types per Supabase table
│   └── loader.ts            ← fetches the 7 tables from Supabase, caches in memory
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

## Data source — Supabase Postgres

`loadDataset()` fetches the seven demo tables from Supabase (paginated
`SELECT *` via `@supabase/supabase-js`, server-side with the service role
key) and caches them in memory for the life of the server process. The tools
operate on the returned plain arrays, exactly as they did when this file read
CSVs. The CSVs in `data/` remain the seed fixtures: `pnpm db:seed` replays
them into Supabase (idempotent wipe + insert).

The `query_database` tool still runs LLM-generated SQL against an in-memory
sql.js (SQLite) mirror hydrated from that dataset — a deliberate sandbox: the
LLM's SQL never touches Postgres.

If we expect heavy queries (e.g. millions of `primes` rows), refactor tool
bodies to issue per-question SQL instead of pulling whole tables.

## Limits / caps

- `LIMIT_DEFAULT = 50`, `LIMIT_MAX = 200` per list call.
- `maxSteps = 8` per agent turn (caps tool-call recursion).
- `list_primes` rejects no-filter calls — that table is 2 500+ rows.
- `temperature = 0.2` — numbers should be deterministic.
