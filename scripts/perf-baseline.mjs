#!/usr/bin/env node
// Throwaway perf baseline for the agent. Runs ~6 representative questions
// against POST /api/agent?stream=text, captures:
//   - TTFT (time to first byte)
//   - total wall-clock
//   - promptTokens / completionTokens / totalTokens / finishReason
//   - tool calls fired
//
// Usage: with `pnpm dev` running on http://localhost:3000 in one terminal,
//   node scripts/perf-baseline.mjs
//   node scripts/perf-baseline.mjs --base http://localhost:3000
//
// Output is a markdown table to stdout. Save it (e.g. `> perf-baseline.md`)
// to compare against post-change runs.
//
// Delete this file once the v1 work in the plan is done; it's not meant to
// stay in the repo.

const NUL = String.fromCharCode(0);
const SENTINEL = `${NUL}__ORKESTRA_AGENT_META__${NUL}`;

// 6 representative questions, mirroring the cases listed in the plan.
// Each entry is an array of messages (so we can test multi-turn).
const CASES = [
  {
    id: "cold-start (dedicated tool)",
    note: "first request — server cold, dataset/sql.js init runs here",
    messages: [{ role: "user", content: "Donne-moi les KPIs du cabinet." }],
  },
  {
    id: "dedicated tool (warm)",
    note: "should match cold-start in tokens, faster in wall-clock",
    messages: [{ role: "user", content: "Quel est le ratio de sinistralité sur la branche auto ?" }],
  },
  {
    id: "query_database — top-N",
    messages: [
      { role: "user", content: "Donne-moi le top 5 des clients par chiffre d'affaires de primes encaissées en 2025." },
    ],
  },
  {
    id: "query_database — ratio with filter",
    messages: [
      { role: "user", content: "Quel est le taux de conversion des prospects pour le secteur santé ?" },
    ],
  },
  {
    id: "mixed (dedicated + sql)",
    messages: [
      { role: "user", content: "Compare le pipeline prospects avec le portefeuille actuel : taille moyenne et conversion." },
    ],
  },
  {
    id: "multi-turn follow-up",
    messages: [
      { role: "user", content: "Quel est le chiffre d'affaires total des primes encaissées ?" },
      { role: "assistant", content: "Le chiffre d'affaires total des primes encaissées est de 2 450 000 CHF." },
      { role: "user", content: "Et le détail par compagnie ?" },
    ],
  },
];

function parseArgs() {
  const args = process.argv.slice(2);
  let base = "http://localhost:3000";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--base" && args[i + 1]) {
      base = args[i + 1];
      i++;
    }
  }
  return { base };
}

function splitTrailer(buffer) {
  const idx = buffer.indexOf(SENTINEL);
  if (idx === -1) return { text: buffer, trailer: null };
  const text = buffer.slice(0, idx);
  const tail = buffer.slice(idx + SENTINEL.length);
  let trailer = null;
  try {
    trailer = JSON.parse(tail);
  } catch {
    trailer = null;
  }
  return { text, trailer };
}

async function runOne(base, kase) {
  const url = `${base}/api/agent?stream=text`;
  const t0 = performance.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: kase.messages }),
  });
  if (!res.ok || !res.body) {
    const errBody = await res.text().catch(() => "");
    return {
      id: kase.id,
      error: `HTTP ${res.status} ${errBody.slice(0, 200)}`,
    };
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let ttft = null;
  let acc = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value && value.byteLength > 0) {
      if (ttft === null) ttft = performance.now() - t0;
      acc += decoder.decode(value, { stream: true });
    }
  }
  acc += decoder.decode();
  const total = performance.now() - t0;
  const { text, trailer } = splitTrailer(acc);
  return {
    id: kase.id,
    note: kase.note,
    ttftMs: ttft === null ? null : Math.round(ttft),
    totalMs: Math.round(total),
    textLen: text.length,
    textWords: text.trim().split(/\s+/).filter(Boolean).length,
    promptTokens: trailer?.usage?.promptTokens ?? null,
    completionTokens: trailer?.usage?.completionTokens ?? null,
    totalTokens: trailer?.usage?.totalTokens ?? null,
    finishReason: trailer?.finishReason ?? null,
    tools: (trailer?.toolCalls ?? []).map((tc) => tc.toolName),
    answerPreview: text.replace(/\s+/g, " ").trim().slice(0, 120),
  };
}

function row(r) {
  if (r.error) {
    return `| ${r.id} | ERROR: ${r.error} | | | | | | | |`;
  }
  const tools = r.tools.length ? r.tools.join(", ") : "—";
  return [
    "",
    r.id,
    r.ttftMs ?? "?",
    r.totalMs ?? "?",
    r.promptTokens ?? "?",
    r.completionTokens ?? "?",
    r.totalTokens ?? "?",
    r.textWords,
    r.finishReason ?? "?",
    tools,
    "",
  ].join(" | ").trim();
}

async function main() {
  const { base } = parseArgs();
  // Sanity check the server is up.
  try {
    const ping = await fetch(`${base}/api/agent`);
    if (!ping.ok) {
      console.error(`Server at ${base} responded ${ping.status}. Is \`pnpm dev\` running?`);
      process.exit(1);
    }
    const health = await ping.json();
    console.error(`# Agent perf baseline`);
    console.error(``);
    console.error(`Server: ${base}  ·  model: ${health.model}  ·  has_api_key: ${health.has_api_key}`);
    console.error(`Dataset: ${JSON.stringify(health.dataset)}`);
    console.error(``);
    if (!health.has_api_key) {
      console.error(`WARNING: no MISTRAL_API_KEY set on the server — runs will error.`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Could not reach ${base}: ${err.message}`);
    console.error(`Start the dev server first:  pnpm dev`);
    process.exit(1);
  }

  console.log(`# Agent perf baseline\n`);
  console.log(`| case | TTFT ms | total ms | prompt tok | completion tok | total tok | words | finish | tools |`);
  console.log(`|------|--------:|---------:|-----------:|---------------:|----------:|------:|--------|-------|`);
  const results = [];
  for (const kase of CASES) {
    process.stderr.write(`Running: ${kase.id} ... `);
    const r = await runOne(base, kase);
    results.push(r);
    console.log(row(r));
    if (r.error) {
      process.stderr.write(`ERROR\n`);
    } else {
      process.stderr.write(`TTFT ${r.ttftMs}ms · total ${r.totalMs}ms · ${r.totalTokens ?? "?"} tok\n`);
    }
  }

  // Aggregate medians (excluding cold-start which warps the mean).
  const warm = results.filter((r) => !r.error && r.id !== "cold-start (dedicated tool)");
  function median(arr) {
    if (arr.length === 0) return null;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  }
  const medTtft = median(warm.map((r) => r.ttftMs).filter((v) => v != null));
  const medTotal = median(warm.map((r) => r.totalMs).filter((v) => v != null));
  const medPrompt = median(warm.map((r) => r.promptTokens).filter((v) => v != null));
  console.log(`\n## Medians (warm runs only)\n`);
  console.log(`- TTFT median:           **${medTtft} ms**`);
  console.log(`- Total median:          **${medTotal} ms**`);
  console.log(`- Prompt tokens median:  **${medPrompt}**`);
  console.log(`\n_Generated by scripts/perf-baseline.mjs at ${new Date().toISOString()}_`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
