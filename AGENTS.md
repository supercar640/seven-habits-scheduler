# AGENTS.md

Guidance for coding agents (Codex, Claude Code, Cursor, etc.) working in this
repository. The full project decision document is `plan/seven-habits-scheduler-handoff.md`
— read it first. `CLAUDE.md` has the same architectural summary in more detail.

## Mission

You are implementing a new greenfield Turborepo monorepo for a **7 Habits-style
planning system** (not an Eisenhower Matrix clone, not a generic Todo app). The
Planner is the center of the product; the Matrix is only a prioritization tool.

## Stack (settled — do not re-litigate)

- pnpm + Turborepo
- `apps/web`: Next.js App Router + shadcn/ui + Tailwind CSS
- `apps/mobile`: Expo React Native with RN-specific UI
- Clerk for auth, Convex for backend / database / realtime sync
- `packages/core` for shared domain logic; `packages/backend` for Convex

## Hard rules

Do:
1. Get a working monorepo first.
2. Wire Clerk + Convex auth, then enforce user data isolation.
3. Build core domain slices (`packages/core`), then feature UI.
4. Keep UI simple but functional.
5. Use **Vertical Slice Architecture** — organize by feature, not technical layer.
6. Gate every per-user Convex query/mutation on `ctx.auth.getUserIdentity()`.
7. Derive quadrants from a single `getQuadrant` in `packages/core`; don't duplicate it.

Do NOT:
- Fork existing Eisenhower Matrix repos — reference them conceptually only.
- Use Supabase, Firebase, a REST-first backend, or a SQL layer.
- Put business logic inside Next.js `app/` routes (keep `page.tsx` thin).
- Force web and mobile to share UI components (share domain logic only).
- Use browser-only local storage as the primary persistence layer.
- Reorganize into layer-first folders (`components/`, `hooks/`, `services/`, …).
- Ask further high-level stack questions before scaffolding — the decisions are made.
- Build a generic Todo app or make the Matrix the whole product.

## Workflow conventions

- Commands: `pnpm dev | build | lint | typecheck | test` (delegate to `turbo`).
- Before claiming a slice done, run `pnpm lint` and `pnpm typecheck`.
- Definition of done for the initial scaffold is in the handoff spec §29 — meet it.

## Git

- No local merges into base branches. Integrate via push → PR → merge on the remote.
  The remote (GitHub) is the single source of truth; the maintainer works across
  multiple machines, so local-only merges cause duplicate work and conflicts.

## Build order

monorepo → web → mobile → backend → core → Clerk+Convex providers → `users` →
`roles` → `goals` → `inbox`/`tasks` → `matrix` → `planner` → `review` → UI polish →
lint/typecheck/build cleanup. Stabilize **auth + users first**.
