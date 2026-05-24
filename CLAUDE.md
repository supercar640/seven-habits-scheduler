# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Greenfield project. The only source of truth so far is the handoff spec at
`plan/seven-habits-scheduler-handoff.md` — read it before scaffolding or making
architecture decisions. This document summarizes the binding decisions from that
spec; when in doubt, the handoff spec wins.

## What This Product Is

A personal productivity app based on Stephen Covey's *7 Habits of Highly Effective
People* time-management philosophy. **It is not an Eisenhower Matrix clone and not a
generic Todo app.** The center of the product is the **Planner**, not the Matrix.

- **Weekly Planner** is the core screen; **Daily Planner** is the execution layer.
- **Matrix** is only a prioritization tool (importance × urgency → Q1–Q4).
- **Roles** and **Goals** give plans direction; **Review** closes the weekly loop.
- The core value is protecting **Q2** work (important but not urgent).

Product flow: sign in → load/create profile → define roles → define goals →
collect tasks in inbox → classify in matrix → select Q2 tasks for the week →
schedule into weekly planner → execute via daily planner → weekly review.

## Tech Stack (do not substitute)

- **Monorepo**: Turborepo + **pnpm** workspaces
- **Web** (`apps/web`): Next.js App Router, React, TypeScript, shadcn/ui + Tailwind CSS
- **Mobile** (`apps/mobile`): Expo, React Native, TypeScript, React Native-specific UI
- **Auth**: Clerk (web: `@clerk/nextjs`, mobile: `@clerk/clerk-expo`)
- **Backend / realtime DB**: Convex (`packages/backend`)
- **Shared domain logic**: `packages/core`

**Do NOT use** Supabase, Firebase, a REST-first backend, or a SQL database layer.

## Architecture: Vertical Slice

Organize by **feature**, never by technical layer. Avoid top-level
`components/`, `hooks/`, `services/`, `types/`, `utils/`, `pages/` as the primary
structure. Each slice owns its own screens, components, hooks, state, and utils.

Feature slices (consistent across web / mobile / backend / core):
`auth`, `users`, `roles`, `goals`, `inbox`, `matrix`, `planner`, `review`, `settings`.

- **Web**: keep `app/` thin — routing, layout, metadata, provider boundary, page
  shell only. Real implementation lives in `apps/web/src/features/*`. A `page.tsx`
  should just render the slice's screen component.
- **Backend**: slice into `convex/<feature>/{queries,mutations,validators,helpers}.ts`.
- **Core**: slice into `packages/core/src/features/<feature>/<feature>.{types,rules,schema,helpers}.ts`.

### What is shared vs. not

Share (in `packages/core`): domain types, validation schemas, date/week
calculation, quadrant rules, planner rules, scheduling helpers, Convex generated
API contracts.

Do **not** share early: web/mobile layout components, navigation, gestures, screen
components, platform-specific forms. **Web and mobile do not share UI.**

## Auth & Data Isolation (critical)

All per-user data is isolated by **Clerk user identity**. Every Convex
query/mutation that touches user data must check `ctx.auth.getUserIdentity()`
first and resolve the user via the `by_clerkUserId` index. Use the shared helpers
in `packages/backend/convex/users/helpers.ts` (`requireIdentity`,
`getCurrentUserOrThrow`) rather than re-implementing the check.

`getQuadrant(importance, urgency)` is the single source for quadrant derivation —
keep it in `packages/core` and import it from backend mutations (do not duplicate).

## Data Model

Convex tables (see spec §17 for full schema): `users`, `roles`, `goals`, `tasks`,
`weeklyPlans`, `scheduleBlocks`, `reviews`. Tasks carry `importance`/`urgency`/
`quadrant` and a status of `inbox | planned | done | deferred | cancelled`.

## Commands

Root scripts (Turborepo, via pnpm): `pnpm dev`, `pnpm build`, `pnpm lint`,
`pnpm typecheck`, `pnpm test` — each delegates to `turbo <task>` (`turbo.json`).
Per package: `pnpm --filter @seven-habits/<name> <script>`
(`core` test = vitest, `web`/`mobile`/`core` typecheck = `tsc --noEmit`).

**One-time setup before backend/runtime works:** run `pnpm --filter
@seven-habits/backend dev` (`convex dev`) once with a Convex account. This
generates `packages/backend/convex/_generated/` (gitignored) and prints the
`*_CONVEX_URL`. Until then, backend typecheck self-skips and the apps can't reach
data at runtime. Also set Clerk keys in each app's `.env` (see `.env.example`).

Toolchain note: pnpm is required; if missing, `npm i -g pnpm` (corepack hit an
EPERM under `C:\Program Files\nodejs` on this machine). pnpm v11 uses the
`allowBuilds:` map in `pnpm-workspace.yaml` to approve dependency build scripts.

## Environment Variables

- `apps/web`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CONVEX_URL`
- `apps/mobile`: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_CONVEX_URL`
- Convex: `CLERK_JWT_ISSUER_DOMAIN` (used by `convex/auth.config.ts`)

## MVP Scope

In: Clerk sign-in/up, Convex profile, Role/Goal CRUD, task inbox,
importance/urgency classification, Q1–Q4 matrix view, weekly planner, daily
planner, weekly review.

Out / later: AI auto-classification, two-way external calendar sync, team
collaboration, advanced recurrence, complex stats dashboards, full monthly/yearly
calendar, advanced notifications.

## Build Order

Scaffold in this order (spec §22): monorepo → web → mobile → backend → core →
Clerk+Convex providers → `users` → `roles` → `goals` → `inbox`/`tasks` →
`matrix` → `planner` → `review` → UI polish → lint/typecheck/build cleanup.
Stabilize **auth + users first** — it's the foundation everything else isolates against.

Do not ask further high-level stack questions before scaffolding; the decisions
above are settled.

## Naming

Repo: `seven-habits-scheduler`. Package scope: `@seven-habits`. App: "Seven Habits Scheduler".
