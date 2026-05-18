"use client";

import React from "react";

/**
 * Tiny zero-dep markdown renderer for the Cabinet Müller agent answers.
 * Handles the subset Gemini actually emits: bold, italic, inline + fenced
 * code, headings (# ## ###), unordered + ordered lists, GFM pipe tables,
 * blockquotes, paragraphs. Plus domain-aware decoration for cabinet IDs,
 * CHF amounts, and percentages.
 *
 * Intentionally not a full CommonMark/GFM parser — this UI is a throwaway
 * test page slated for replacement, so we keep it light.
 */

const ID_RE = /\b(?:CLT|POL|SIN|PRM|REN|PROS|CMP)\d{3,6}\b|\bC00\d\b/g;

// CHF amounts: "24 000 CHF", "1.5M CHF", "11 250.50 CHF", "12.4K CHF"
const AMOUNT_RE = /\b\d{1,3}(?:[  ]\d{3})*(?:[.,]\d+)?\s?(?:M|K)?\s?CHF\b/g;

// percentages: "12 %", "87.5%", "+4 pt"
const PERCENT_RE = /[+-]?\d+(?:[.,]\d+)?\s?(?:%|pt\b)/g;

type Inline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "bold"; children: Inline[] }
  | { type: "italic"; children: Inline[] }
  | { type: "id"; value: string }
  | { type: "amount"; value: string }
  | { type: "percent"; value: string };

/* ─── inline parsing ───────────────────────────────────────────────── */

function decorate(text: string): Inline[] {
  // Find all decoration matches (ids / amounts / percents) without overlap.
  const matches: { start: number; end: number; node: Inline }[] = [];

  for (const re of [ID_RE, AMOUNT_RE, PERCENT_RE] as const) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const value = m[0];
      const start = m.index;
      const end = start + value.length;
      matches.push({
        start,
        end,
        node:
          re === ID_RE
            ? { type: "id", value }
            : re === AMOUNT_RE
              ? { type: "amount", value }
              : { type: "percent", value },
      });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  // Drop overlapping matches (keep first).
  const accepted: typeof matches = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      accepted.push(m);
      lastEnd = m.end;
    }
  }

  if (accepted.length === 0) return [{ type: "text", value: text }];

  const out: Inline[] = [];
  let cursor = 0;
  for (const m of accepted) {
    if (m.start > cursor) out.push({ type: "text", value: text.slice(cursor, m.start) });
    out.push(m.node);
    cursor = m.end;
  }
  if (cursor < text.length) out.push({ type: "text", value: text.slice(cursor) });
  return out;
}

function parseInline(input: string): Inline[] {
  // Pass 1: extract `inline code`, **bold**, *italic* in order, recursing
  // into bold/italic for any remaining inline markup. Anything left over
  // gets decoration (IDs/amounts/percents).
  const out: Inline[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push(...decorate(buf));
      buf = "";
    }
  };

  while (i < input.length) {
    const c = input[i];

    if (c === "`") {
      const end = input.indexOf("`", i + 1);
      if (end > i) {
        flush();
        out.push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (c === "*" && input[i + 1] === "*") {
      const end = input.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ type: "bold", children: parseInline(input.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (c === "*") {
      // single-* italic, but only if not followed by space and a closer exists
      const end = input.indexOf("*", i + 1);
      if (end > i + 1 && input[i + 1] !== " " && input[end - 1] !== " ") {
        flush();
        out.push({ type: "italic", children: parseInline(input.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    buf += c;
    i++;
  }
  flush();
  return out;
}

/* ─── inline renderer ──────────────────────────────────────────────── */

function renderInline(nodes: Inline[], keyPrefix = ""): React.ReactNode[] {
  return nodes.map((n, i) => {
    const k = `${keyPrefix}${i}`;
    switch (n.type) {
      case "text":
        return <React.Fragment key={k}>{n.value}</React.Fragment>;
      case "code":
        return <CodeChip key={k}>{n.value}</CodeChip>;
      case "bold":
        return (
          <strong key={k} style={{ fontWeight: 700, color: "#0F172A" }}>
            {renderInline(n.children, `${k}b`)}
          </strong>
        );
      case "italic":
        return (
          <em key={k} style={{ fontStyle: "italic" }}>
            {renderInline(n.children, `${k}i`)}
          </em>
        );
      case "id":
        return <IdChip key={k}>{n.value}</IdChip>;
      case "amount":
        return <AmountChip key={k}>{n.value}</AmountChip>;
      case "percent":
        return <PercentChip key={k}>{n.value}</PercentChip>;
    }
  });
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: "0.86em",
        background: "#F1F5F9",
        color: "#1E293B",
        padding: "0.08em 0.36em",
        borderRadius: 4,
        border: "1px solid #E2E8F0",
      }}
    >
      {children}
    </code>
  );
}

function IdChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: "0.84em",
        fontWeight: 600,
        color: "#1E40AF",
        background: "#EFF6FF",
        padding: "0.08em 0.42em",
        borderRadius: 4,
        border: "1px solid #DBEAFE",
        letterSpacing: "0.01em",
        verticalAlign: "baseline",
      }}
    >
      {children}
    </span>
  );
}

function AmountChip({ children }: { children: React.ReactNode }) {
  // Split off the trailing CHF for a tiny suffix badge.
  const text = String(children);
  const m = text.match(/^(.*?)(\s?CHF)\s*$/);
  const amount = m ? m[1].trim() : text;
  const unit = m ? "CHF" : null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.2em",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 600,
        color: "#0F172A",
        letterSpacing: "-0.01em",
      }}
    >
      {amount}
      {unit && (
        <span
          style={{
            fontSize: "0.72em",
            fontWeight: 600,
            color: "#64748B",
            letterSpacing: "0.04em",
          }}
        >
          {unit}
        </span>
      )}
    </span>
  );
}

function PercentChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 600,
        color: "#0F172A",
      }}
    >
      {children}
    </span>
  );
}

/* ─── block parsing ────────────────────────────────────────────────── */

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "fence"; lang: string | null; code: string }
  | { type: "table"; header: string[]; align: ("left" | "center" | "right" | null)[]; rows: string[][] }
  | { type: "hr" };

function isTableSep(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\||\|$/g, "");
  return trimmed.split("|").map((c) => c.trim());
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code
    if (/^```/.test(line.trim())) {
      const lang = line.trim().slice(3).trim() || null;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "fence", lang, code: codeLines.join("\n") });
      continue;
    }

    // Horizontal rule
    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings — accept 1-6 `#`, cap rendering at h3 so `####` and beyond
    // don't render as a literal `####` paragraph (Mistral over-uses level 4+).
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(h[1].length, 3) as 1 | 2 | 3;
      blocks.push({ type: `h${level}` as "h1" | "h2" | "h3", text: h[2].trim() });
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", text: buf.join("\n") });
      continue;
    }

    // Table — header line followed by separator
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c): "left" | "center" | "right" | null => {
        const left = c.startsWith(":");
        const right = c.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return null;
      });
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, align, rows });
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph: gather consecutive non-blank lines
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|>|```|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: buf.join(" ") });
  }

  return blocks;
}

/* ─── block renderer ───────────────────────────────────────────────── */

function renderBlock(b: Block, key: number): React.ReactNode {
  switch (b.type) {
    case "h1":
      return (
        <h1
          key={key}
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#0F172A",
            letterSpacing: "-0.02em",
            margin: "1.1rem 0 0.55rem",
            lineHeight: 1.25,
          }}
        >
          {renderInline(parseInline(b.text), `h1-${key}-`)}
        </h1>
      );
    case "h2":
      return (
        <h2
          key={key}
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "#0F172A",
            letterSpacing: "-0.015em",
            margin: "1rem 0 0.45rem",
            lineHeight: 1.3,
          }}
        >
          {renderInline(parseInline(b.text), `h2-${key}-`)}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={key}
          style={{
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "#1E40AF",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0.85rem 0 0.35rem",
          }}
        >
          {renderInline(parseInline(b.text), `h3-${key}-`)}
        </h3>
      );
    case "paragraph":
      return (
        <p
          key={key}
          style={{
            margin: "0.4rem 0",
            lineHeight: 1.6,
            color: "#1E293B",
          }}
        >
          {renderInline(parseInline(b.text), `p-${key}-`)}
        </p>
      );
    case "ul":
      return (
        <ul
          key={key}
          style={{
            margin: "0.4rem 0 0.4rem 0",
            paddingLeft: "1.15rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.18rem",
          }}
        >
          {b.items.map((it, i) => (
            <li
              key={i}
              style={{
                lineHeight: 1.55,
                color: "#1E293B",
                paddingLeft: "0.15rem",
                position: "relative",
                listStyle: "none",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "-0.85rem",
                  top: "0.62em",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#1E40AF",
                  opacity: 0.7,
                }}
              />
              {renderInline(parseInline(it), `ul-${key}-${i}-`)}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={key}
          style={{
            margin: "0.4rem 0",
            paddingLeft: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.18rem",
            color: "#1E293B",
          }}
        >
          {b.items.map((it, i) => (
            <li key={i} style={{ lineHeight: 1.55 }}>
              {renderInline(parseInline(it), `ol-${key}-${i}-`)}
            </li>
          ))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          style={{
            margin: "0.6rem 0",
            padding: "0.55rem 0.9rem",
            borderLeft: "3px solid #DBEAFE",
            background: "#F8FAFC",
            color: "#475569",
            borderRadius: "0 6px 6px 0",
            fontStyle: "italic",
            lineHeight: 1.55,
          }}
        >
          {renderInline(parseInline(b.text), `bq-${key}-`)}
        </blockquote>
      );
    case "fence":
      return (
        <pre
          key={key}
          style={{
            margin: "0.6rem 0",
            padding: "0.85rem 1rem",
            background: "#0F172A",
            color: "#E2E8F0",
            borderRadius: 8,
            overflow: "auto",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "0.82rem",
            lineHeight: 1.55,
            border: "1px solid #1E293B",
          }}
        >
          {b.lang && (
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#64748B",
                marginBottom: "0.4rem",
              }}
            >
              {b.lang}
            </div>
          )}
          <code style={{ fontFamily: "inherit", color: "inherit" }}>{b.code}</code>
        </pre>
      );
    case "table":
      return (
        <div
          key={key}
          className="md-table-wrap"
          style={{
            margin: "0.7rem 0",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            background: "#FFFFFF",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.86rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {b.header.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: b.align[i] ?? "left",
                      padding: "0.55rem 0.75rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#64748B",
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    {renderInline(parseInline(h), `th-${key}-${i}-`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 === 0 ? "#FFFFFF" : "#FBFCFD",
                    borderTop: ri === 0 ? "none" : "1px solid #F1F5F9",
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        textAlign: b.align[ci] ?? "left",
                        padding: "0.5rem 0.75rem",
                        color: "#1E293B",
                        verticalAlign: "top",
                      }}
                    >
                      {renderInline(parseInline(cell), `td-${key}-${ri}-${ci}-`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "hr":
      return (
        <hr
          key={key}
          style={{
            margin: "0.85rem 0",
            border: "none",
            height: 1,
            background: "#E2E8F0",
          }}
        />
      );
  }
}

/* ─── public component ────────────────────────────────────────────── */

export function Markdown({ source }: { source: string }) {
  const blocks = React.useMemo(() => parseBlocks(source), [source]);
  return (
    <div
      className="md-root"
      style={{
        fontSize: "0.92rem",
        color: "#1E293B",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      <style>{`
        .md-root { min-width: 0; }
        /* Scoped wrap: only block-level text containers wrap long words.
         * Tables, code, and inline chips keep natural word boundaries so
         * narrow chat bubbles don't break content character-by-character. */
        .md-root p,
        .md-root li,
        .md-root blockquote,
        .md-root h1,
        .md-root h2,
        .md-root h3 {
          overflow-wrap: break-word;
          word-break: normal;
        }
        .md-root img,
        .md-root svg,
        .md-root video { max-width: 100%; height: auto; }
        .md-root pre { max-width: 100%; overflow-x: auto; overflow-y: hidden; }
        .md-root pre code { white-space: pre; }
        /* Tables: wrapper scrolls horizontally; cells keep natural sizing
         * (no aggressive break that produces 1-char-wide columns). */
        .md-root .md-table-wrap {
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .md-root .md-table-wrap table { width: max-content; min-width: 100%; }
        .md-root .md-table-wrap td,
        .md-root .md-table-wrap th {
          word-break: normal;
          overflow-wrap: normal;
          white-space: normal;
        }
        .md-root a {
          overflow-wrap: anywhere;
          word-break: break-all;
        }
      `}</style>
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}
