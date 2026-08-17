# Core Domain Logic Completion — Design

Date: 2026-06-28
Scope: `packages/core` (`@seven-habits/core`)
Status: Approved (design)

## Goal

Complete the shared domain layer in `packages/core` so that backend mutations
and both apps (web/mobile) import proven, fully unit-tested logic. This work has
**zero dependency on Clerk/Convex accounts** — it is verified entirely offline via
`pnpm --filter @seven-habits/core test`. It corresponds to build-order step 5
(core), which precedes every data slice.

## Approach

- **Zero-dependency + zod.** Date and scheduling math is hand-implemented (no
  external date library), consistent with the existing `date/week.helpers.ts`.
  Validation uses `zod`, already a dependency (see `tasks.schema.ts`). `core` is
  inherited by web, mobile, and backend, so we avoid adding dependencies there.
  Alternative considered: `date-fns` — rejected to keep the shared package
  dependency-free (the handoff spec §25 shows hand-rolled examples).
- **Time representation.** `scheduleBlock.startAt/endAt` are epoch milliseconds
  (`number`) per the data model (spec §16/§17). Scheduling helpers operate purely
  on numbers — no `Date` needed for overlap/duration — so they are timezone-safe
  and trivially testable.
- **Vertical slice.** New code stays slice-local (`features/<slice>/...`) plus
  cross-cutting `date/`, `scheduling/`, and `validation/` folders, matching spec §6.

## Current State (already present, keep)

- `features/matrix`: `matrix.types` (`Importance`/`Urgency`/`Quadrant`),
  `matrix.rules` (`getQuadrant`, `isQ2Task`) + test. **Complete.**
- `features/tasks`: `tasks.types` (`TaskInput`, `TaskStatus`),
  `tasks.schema` (`taskInputSchema`) + test.
- `features/roles|goals|planner|review`: types only.
- `date/week.helpers`: `getWeekStartDate`, `toISODateString`, `WeekStartsOn` + test.

## Work Items

### 1. `date/week.helpers.ts` (augment)

Add, with the existing Monday-default and local-midnight conventions:

- `addDays(date: Date, n: number): Date`
- `addWeeks(date: Date, n: number): Date`
- `getWeekRange(date: Date, weekStartsOn?: WeekStartsOn): { start: Date; end: Date }`
  — `end` is exclusive (start + 7 days).
- `getWeekDays(date: Date, weekStartsOn?: WeekStartsOn): Date[]` — 7 local-midnight days.
- `isSameWeek(a: Date, b: Date, weekStartsOn?: WeekStartsOn): boolean`
- `parseISODate(value: string): Date` — parse `"YYYY-MM-DD"` to local midnight
  (inverse of `toISODateString`).

### 2. `scheduling/` (new, cross-cutting)

- `scheduling.types.ts`: `TimeBlock { startAt: number; endAt: number }` (epoch ms).
- `scheduling.helpers.ts`:
  - `isValidBlock(block: TimeBlock): boolean` — `endAt > startAt`.
  - `getDurationMinutes(block: TimeBlock): number`.
  - `blocksOverlap(a: TimeBlock, b: TimeBlock): boolean` — half-open `[start, end)`;
    touching (`a.endAt === b.startAt`) is **not** a conflict.
  - `sortBlocksByStart<T extends TimeBlock>(blocks: T[]): T[]` — immutable copy.
  - `detectConflicts<T extends TimeBlock>(blocks: T[]): [T, T][]` — overlapping
    pairs; detection only, no policy (caller decides allow/reject).
  - `findFreeSlots(blocks: TimeBlock[], dayStart: number, dayEnd: number, minMinutes?: number): TimeBlock[]`
    — gaps within `[dayStart, dayEnd)`, optionally filtered by a minimum length.

### 3. `features/tasks/tasks.rules.ts` (new) — strict status state machine

Transition matrix:

| from        | allowed `to`                          |
|-------------|---------------------------------------|
| `inbox`     | `planned`, `cancelled`                |
| `planned`   | `inbox`, `done`, `deferred`, `cancelled` |
| `deferred`  | `planned`, `inbox`, `cancelled`       |
| `done`      | `planned` (reopen)                    |
| `cancelled` | `inbox` (reactivate)                  |

- `TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]>`.
- `canTransition(from: TaskStatus, to: TaskStatus): boolean` — same-state
  (`x → x`) is **not** a transition → `false` (callers treat as no-op).
- `getAllowedTransitions(from: TaskStatus): TaskStatus[]`.

### 4. `features/planner/`

- `planner.rules.ts` (new):
  - `BIG_ROCK_SOFT_LIMIT = 6`.
  - `evaluateBigRocks(taskIds: string[]): { count: number; withinRecommended: boolean; warning?: string }`
    — soft recommendation: never blocks; flags when over the limit.
- `planner.schema.ts` (new): `weeklyPlanInputSchema`, `scheduleBlockInputSchema`.
- `planner.types.ts` (augment): `WeeklyPlanInput`, `ScheduleBlockInput`.

### 5. Validation schemas (new; only `tasks` exists today)

- `validation/common.ts`:
  - `isoDateStringSchema` — `z.string()` matching `YYYY-MM-DD` and refined to a
    real calendar date.
  - `idSchema` — `z.string().min(1)` (Convex id placeholder at the domain layer).
  Reused by the slice schemas below.
- `features/roles/roles.schema.ts`: `roleInputSchema` — `name` required (trim,
  min 1), `description?`, `sortOrder` number.
- `features/goals/goals.schema.ts`: `goalInputSchema` — `title` required,
  `description?`, `horizon` (`yearly|monthly|weekly`), `roleId?`, `status`
  (`active|completed|archived`).
- `features/review/review.schema.ts`: `reviewInputSchema` — `periodType`
  (`weekly|monthly|yearly`), `periodStartDate` (`isoDateStringSchema`),
  `wins?`, `misses?`, `lessons?`, `nextAdjustments?`.

### 6. `src/index.ts` (augment)

Export all new symbols (types, rules, schemas, helpers) to keep the single barrel.

## Testing

vitest, fully offline. One test file per new `*.rules.ts` / `*.schema.ts` /
`scheduling.helpers.ts` and the `week.helpers.ts` additions. Built **TDD
(red → green)**. Boundary cases to cover:

- Week boundaries for Monday and Sunday starts; local-midnight stability across
  month boundaries.
- Touching blocks are not a conflict; nested/partial overlaps are.
- Free-slot edges (slot exactly at `dayStart`/`dayEnd`; `minMinutes` filter).
- Every legal/illegal status transition; same-state returns `false`.
- Big-rock at the 6 boundary (6 = within, 7 = warning).
- ISO date rejection (`2026-13-01`, `2026-02-30`, non-`YYYY-MM-DD`).

## Definition of Done

- `pnpm --filter @seven-habits/core test` — green.
- `pnpm --filter @seven-habits/core typecheck` — green.
- All new symbols exported from `src/index.ts`.

## Out of Scope (deferred)

- Aligning backend `tasks/mutations.ts` to import `getQuadrant` from core, and any
  other backend wiring — deferred until Convex codegen is available (needs a
  Convex account), since backend typecheck self-skips without `_generated/`.
- Web/mobile UI, providers, and any Clerk/Convex runtime work.
