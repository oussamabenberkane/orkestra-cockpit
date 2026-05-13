# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

- **Next.js 16.2** (App Router) on **React 19**, TypeScript strict mode, path alias `@/* → ./src/*`.
- **Tailwind CSS v4** via `@tailwindcss/postcss`. There is no `tailwind.config.{js,ts}` — design tokens live in [src/app/globals.css](src/app/globals.css) using `@theme inline { ... }` and CSS variables. Do not create a Tailwind config file; extend tokens by editing `globals.css`.
- **shadcn/ui** with the `base-nova` style on top of **`@base-ui/react`** primitives (not Radix). See [components.json](components.json). When adding UI components from shadcn, they will be wired to `@base-ui/react` — do not import from `@radix-ui/*`.
- **Icons:** `lucide-react`. **Animation:** `framer-motion`. **Class merging:** `cn()` in [src/lib/utils.ts](src/lib/utils.ts).
- Package manager: **pnpm** (lockfile + `pnpm-workspace.yaml` present, though this is a single-package repo).

## Commands

```bash
pnpm dev      # next dev — http://localhost:3000
pnpm build    # next build
pnpm start    # next start (after build)
```

There is no lint, test, or typecheck script configured. For typechecking run `pnpm exec tsc --noEmit`.

## Architecture

This is a single-page BFSI cockpit demo for "Cabinet Müller & Associés SA" (French/Swiss insurance brokerage). It is a static prototype — **there is no backend, no auth, no data fetching**. All displayed figures are hardcoded in components or in [src/lib/modal-data.ts](src/lib/modal-data.ts).

**Routes** ([src/app/](src/app/)):
- `/` → [page.tsx](src/app/page.tsx) just `redirect("/login")`.
- `/login` → server component composing `BrandPanel` + `LoginForm`. The form does not authenticate — it routes to `/dashboard`.
- `/dashboard` → **client component** ([dashboard/page.tsx](src/app/dashboard/page.tsx)) that owns all top-level UI state: which modal is open (`ModalKey | null`), settings modal, sidebar open/close. Modal state is passed down via `onOpenModal` callbacks through `TilesGrid` and `AgentsSection`.

**Dashboard composition** ([src/components/dashboard/](src/components/dashboard/)) is a fixed vertical stack: `DashboardHeader` → (`Sidebar` | `main`: `KPIRow` + `CombinedBanner` + `TilesGrid` + `AgentsSection`) → `DashboardFooter`. The page uses `height: 100vh; overflow: hidden` with only `<main>` scrolling — preserve this when editing the layout shell.

**Modal content** for the seven tiles/agents is centralized in [src/lib/modal-data.ts](src/lib/modal-data.ts), keyed by `ModalKey` (`finance | vue360 | sinistres | prospection | portefeuille | agents | rapport`). To add a new modal: extend `ModalKey` in [src/lib/types.ts](src/lib/types.ts), add an entry to `modalData`, then reference the key from a `Tile` or `AgentCard`.

**Styling convention is mixed and intentional:**
- Brand tokens (navy `#1E2761`, malyz `#2B3AE8`, teal `#028090`, etc.) are defined twice in [src/app/globals.css](src/app/globals.css): once as `--color-*` inside `@theme inline` (Tailwind utilities) and once as plain `--*` on `:root` (inline styles).
- Components heavily use **inline `style={{ ... }}`** with these CSS variables and literal hex values, not Tailwind utility classes. Match this style when editing existing components rather than refactoring to Tailwind. Use Tailwind only where the surrounding code already does (mostly `cn()`-based UI primitives in [src/components/ui/](src/components/ui/)).
- Fonts: Plus Jakarta Sans (`--font-jakarta`) and DM Mono (`--font-mono`), loaded via `next/font/google` in [src/app/layout.tsx](src/app/layout.tsx). The app lang is `fr`.

**Dialogs** wrap `@base-ui/react`'s `Dialog` primitive in [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx). `DashboardModal` is a single dialog driven by `modalKey` — opening a tile sets the key; closing sets it to `null`. Do not create per-tile dialogs.

## Commit Convention

Single-line format only: `<type>: <short imperative description>`

**Allowed types:** `feat` · `fix` · `refactor` · `chore` · `docs` · `test`

**Rules:**
- Imperative mood, capitalised: "Add", "Fix", "Update" — not "Added" or "Fixes"
- No body, no trailers, no `Co-Authored-By`, no AI attribution
- One logical change per commit

```
feat: Add KPI sparkline to dashboard header
fix: Correct modal close behaviour on Escape key
refactor: Extract brand tokens to globals.css
chore: Move demo CSV files to data/
```

## Conventions worth knowing

- Components that own state or use hooks must start with `"use client"`. The root `/dashboard` page is a client component because it owns modal state — keep new stateful additions inside child client components rather than promoting the page if you can avoid it.
- Copy is in French. Keep French strings when editing user-facing labels.
- The repo is responsive (see the most recent commit) — `page-header-row`, `source-pills-row`, and `dashboard-main-padding` are responsive helper classes defined in `globals.css`. Use them rather than introducing new media queries when extending the dashboard header area.
