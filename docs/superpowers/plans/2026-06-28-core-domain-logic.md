# Core Domain Logic Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the shared domain layer in `packages/core` (date/scheduling helpers, strict task status state machine, planner big-rock rule, and roles/goals/review/planner validation schemas), fully unit-tested offline.

**Architecture:** Pure, dependency-free TypeScript organized by vertical slice. Date and scheduling math are hand-implemented; validation uses the already-present `zod`. Scheduling operates on epoch-millisecond numbers (no `Date`), so it is timezone-safe. Everything is verified with vitest — zero dependency on Clerk/Convex accounts.

**Tech Stack:** TypeScript (strict, `tsc --noEmit`), zod ^3.24.1, vitest ^2.1.x, pnpm + Turborepo.

## Global Constraints

- Package: `@seven-habits/core` at `packages/core`. All paths below are relative to repo root `C:\AI_project\testbed\7habits-scheduler`.
- **No new runtime dependencies.** Only `zod` (already a dependency). Date/scheduling logic is hand-rolled — do not add `date-fns` or similar.
- **Vertical slice only.** New files live under `features/<slice>/` or the cross-cutting `date/`, `scheduling/`, `validation/` folders. No top-level `utils/`, `services/`, `types/`.
- Test files are colocated, named `*.test.ts`, and use `import { describe, expect, it } from "vitest";`.
- Schemas typed as `z.ZodType<XInput>` to mirror the existing `taskInputSchema` pattern.
- `getQuadrant` stays the single source in `features/matrix/matrix.rules.ts` — do not duplicate.
- Every commit subject is conventional (`feat:`/`test:`), ends with the two standard trailers (`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_014SK57zczepe4GHrDmWyb32`), and is pushed immediately (solo-project workflow: commit to `feat/monorepo-scaffold` and `git push`).
- Run commands from repo root. Per-file test: `pnpm --filter @seven-habits/core test <path>`. Full suite: `pnpm --filter @seven-habits/core test`. Typecheck: `pnpm --filter @seven-habits/core typecheck`.

## File Structure

```
packages/core/src/
  date/
    week.helpers.ts        (MODIFY: add addDays, addWeeks, getWeekRange, getWeekDays, isSameWeek, parseISODate)
    week.helpers.test.ts   (MODIFY: add tests for the above)
  scheduling/              (NEW folder)
    scheduling.types.ts    (NEW: TimeBlock)
    scheduling.helpers.ts  (NEW: overlap/duration/conflict/free-slot helpers)
    scheduling.helpers.test.ts (NEW)
  validation/              (NEW folder)
    common.ts              (NEW: idSchema, isoDateStringSchema)
    common.test.ts         (NEW)
  features/
    tasks/
      tasks.rules.ts       (NEW: status state machine)
      tasks.rules.test.ts  (NEW)
    roles/
      roles.types.ts       (MODIFY: add RoleInput)
      roles.schema.ts      (NEW: roleInputSchema)
      roles.schema.test.ts (NEW)
    goals/
      goals.types.ts       (MODIFY: add GoalInput)
      goals.schema.ts      (NEW: goalInputSchema)
      goals.schema.test.ts (NEW)
    review/
      review.types.ts      (MODIFY: add ReviewInput)
      review.schema.ts     (NEW: reviewInputSchema)
      review.schema.test.ts(NEW)
    planner/
      planner.types.ts     (MODIFY: add WeeklyPlanInput, ScheduleBlockInput)
      planner.rules.ts     (NEW: BIG_ROCK_SOFT_LIMIT, evaluateBigRocks)
      planner.rules.test.ts(NEW)
      planner.schema.ts    (NEW: weeklyPlanInputSchema, scheduleBlockInputSchema)
      planner.schema.test.ts(NEW)
  index.ts                 (MODIFY: export all new symbols)
```

Task order respects dependencies: `validation/common.ts` (Task 4) is consumed by goals/review/planner schemas (Tasks 6, 7, 9).

---

### Task 1: Date helpers (week math)

**Files:**
- Modify: `packages/core/src/date/week.helpers.ts`
- Test: `packages/core/src/date/week.helpers.test.ts`

**Interfaces:**
- Consumes: existing `getWeekStartDate`, `toISODateString`, `WeekStartsOn`.
- Produces: `addDays(date: Date, n: number): Date`, `addWeeks(date: Date, n: number): Date`, `getWeekRange(date: Date, weekStartsOn?: WeekStartsOn): { start: Date; end: Date }`, `getWeekDays(date: Date, weekStartsOn?: WeekStartsOn): Date[]`, `isSameWeek(a: Date, b: Date, weekStartsOn?: WeekStartsOn): boolean`, `parseISODate(value: string): Date`.

- [ ] **Step 1: Write the failing tests** — replace the full contents of `packages/core/src/date/week.helpers.test.ts` with:

```ts
import { describe, expect, it } from "vitest";

import {
  addDays,
  addWeeks,
  getWeekDays,
  getWeekRange,
  getWeekStartDate,
  isSameWeek,
  parseISODate,
  toISODateString,
} from "./week.helpers";

describe("getWeekStartDate", () => {
  it("returns Monday at local midnight for a Wednesday when the week starts on Monday", () => {
    const input = new Date(2026, 4, 27, 15, 30, 45, 123);
    const result = getWeekStartDate(input);

    expect(result).toEqual(new Date(2026, 4, 25, 0, 0, 0, 0));
    expect(input).toEqual(new Date(2026, 4, 27, 15, 30, 45, 123));
  });

  it("returns Sunday at local midnight when the week starts on Sunday", () => {
    const input = new Date(2026, 4, 27, 15, 30, 45, 123);
    const result = getWeekStartDate(input, "sunday");

    expect(result).toEqual(new Date(2026, 4, 24, 0, 0, 0, 0));
  });
});

describe("toISODateString", () => {
  it("formats local date parts as YYYY-MM-DD", () => {
    expect(toISODateString(new Date(2026, 0, 5, 23, 59, 59, 999))).toBe("2026-01-05");
  });
});

describe("addDays", () => {
  it("adds days and preserves time-of-day across a month boundary", () => {
    expect(addDays(new Date(2026, 0, 31, 9, 0, 0, 0), 1)).toEqual(new Date(2026, 1, 1, 9, 0, 0, 0));
  });

  it("subtracts days for negative input", () => {
    expect(addDays(new Date(2026, 1, 1), -1)).toEqual(new Date(2026, 0, 31));
  });
});

describe("addWeeks", () => {
  it("adds 7 days per week", () => {
    expect(addWeeks(new Date(2026, 4, 25), 2)).toEqual(new Date(2026, 5, 8));
  });
});

describe("getWeekRange", () => {
  it("returns the Monday start and the exclusive end 7 days later", () => {
    const { start, end } = getWeekRange(new Date(2026, 4, 27, 12, 0, 0, 0));
    expect(start).toEqual(new Date(2026, 4, 25, 0, 0, 0, 0));
    expect(end).toEqual(new Date(2026, 5, 1, 0, 0, 0, 0));
  });
});

describe("getWeekDays", () => {
  it("returns 7 local-midnight days starting on Monday", () => {
    const days = getWeekDays(new Date(2026, 4, 27));
    expect(days).toHaveLength(7);
    expect(days[0]).toEqual(new Date(2026, 4, 25, 0, 0, 0, 0));
    expect(days[6]).toEqual(new Date(2026, 4, 31, 0, 0, 0, 0));
  });
});

describe("isSameWeek", () => {
  it("is true within the same Monday-started week and false across the boundary", () => {
    expect(isSameWeek(new Date(2026, 4, 25), new Date(2026, 4, 31))).toBe(true);
    expect(isSameWeek(new Date(2026, 4, 25), new Date(2026, 5, 1))).toBe(false);
  });
});

describe("parseISODate", () => {
  it("parses YYYY-MM-DD to local midnight", () => {
    expect(parseISODate("2026-01-05")).toEqual(new Date(2026, 0, 5, 0, 0, 0, 0));
  });

  it("rejects malformed and impossible dates", () => {
    expect(() => parseISODate("2026-13-01")).toThrow();
    expect(() => parseISODate("2026-02-30")).toThrow();
    expect(() => parseISODate("2026-5-7")).toThrow();
    expect(() => parseISODate("not-a-date")).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @seven-habits/core test src/date/week.helpers.test.ts`
Expected: FAIL — Vite reports no matching export for `addDays`/`addWeeks`/etc.

- [ ] **Step 3: Add the implementation** — replace the full contents of `packages/core/src/date/week.helpers.ts` with:

```ts
export type WeekStartsOn = "monday" | "sunday";

/** Returns a new Date at 00:00:00.000 (local) of the week-start day containing `date`. Default Monday. */
export function getWeekStartDate(date: Date, weekStartsOn: WeekStartsOn = "monday"): Date {
  const weekStartDate = new Date(date);
  weekStartDate.setHours(0, 0, 0, 0);

  const day = weekStartDate.getDay();
  const daysToSubtract = weekStartsOn === "monday" ? (day + 6) % 7 : day;
  weekStartDate.setDate(weekStartDate.getDate() - daysToSubtract);

  return weekStartDate;
}

/** Formats a Date as "YYYY-MM-DD" using local date parts. */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Returns a new Date `n` days after `date` (negative for earlier), preserving the time-of-day. */
export function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

/** Returns a new Date `n` weeks after `date` (negative for earlier), preserving the time-of-day. */
export function addWeeks(date: Date, n: number): Date {
  return addDays(date, n * 7);
}

/**
 * Returns the week containing `date` as a half-open range: `start` is the week-start day
 * at local midnight, `end` is exactly 7 days later (exclusive).
 */
export function getWeekRange(
  date: Date,
  weekStartsOn: WeekStartsOn = "monday",
): { start: Date; end: Date } {
  const start = getWeekStartDate(date, weekStartsOn);
  return { start, end: addDays(start, 7) };
}

/** Returns the 7 days of the week containing `date`, each at local midnight, week-start first. */
export function getWeekDays(date: Date, weekStartsOn: WeekStartsOn = "monday"): Date[] {
  const start = getWeekStartDate(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** True when `a` and `b` fall in the same week (identical week-start day). */
export function isSameWeek(a: Date, b: Date, weekStartsOn: WeekStartsOn = "monday"): boolean {
  return (
    getWeekStartDate(a, weekStartsOn).getTime() === getWeekStartDate(b, weekStartsOn).getTime()
  );
}

/** Parses a "YYYY-MM-DD" string into a Date at local midnight. Throws on malformed or impossible input. */
export function parseISODate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }

  return date;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @seven-habits/core test src/date/week.helpers.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/date/week.helpers.ts packages/core/src/date/week.helpers.test.ts
git commit -m "feat(core): add week range, day list, isSameWeek, and ISO date helpers"
git push
```

---

### Task 2: Scheduling helpers

**Files:**
- Create: `packages/core/src/scheduling/scheduling.types.ts`
- Create: `packages/core/src/scheduling/scheduling.helpers.ts`
- Test: `packages/core/src/scheduling/scheduling.helpers.test.ts`

**Interfaces:**
- Produces: `TimeBlock { startAt: number; endAt: number }`; `isValidBlock(block: TimeBlock): boolean`, `getDurationMinutes(block: TimeBlock): number`, `blocksOverlap(a: TimeBlock, b: TimeBlock): boolean`, `sortBlocksByStart<T extends TimeBlock>(blocks: T[]): T[]`, `detectConflicts<T extends TimeBlock>(blocks: T[]): [T, T][]`, `findFreeSlots(blocks: TimeBlock[], dayStart: number, dayEnd: number, minMinutes?: number): TimeBlock[]`.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/scheduling/scheduling.helpers.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  blocksOverlap,
  detectConflicts,
  findFreeSlots,
  getDurationMinutes,
  isValidBlock,
  sortBlocksByStart,
} from "./scheduling.helpers";

const MIN = 60000; // one minute in milliseconds
const block = (startMin: number, endMin: number) => ({ startAt: startMin * MIN, endAt: endMin * MIN });

describe("isValidBlock", () => {
  it("requires a positive duration", () => {
    expect(isValidBlock(block(0, 30))).toBe(true);
    expect(isValidBlock(block(30, 30))).toBe(false);
    expect(isValidBlock(block(30, 0))).toBe(false);
  });
});

describe("getDurationMinutes", () => {
  it("returns whole minutes", () => {
    expect(getDurationMinutes(block(0, 90))).toBe(90);
  });
});

describe("blocksOverlap", () => {
  it("is false for touching blocks", () => {
    expect(blocksOverlap(block(0, 60), block(60, 120))).toBe(false);
  });

  it("is true for partial overlap", () => {
    expect(blocksOverlap(block(0, 60), block(30, 90))).toBe(true);
  });

  it("is true for fully nested blocks", () => {
    expect(blocksOverlap(block(0, 120), block(30, 60))).toBe(true);
  });
});

describe("sortBlocksByStart", () => {
  it("sorts by start without mutating the input", () => {
    const input = [block(60, 90), block(0, 30)];
    const result = sortBlocksByStart(input);
    expect(result.map((b) => b.startAt)).toEqual([0, 60 * MIN]);
    expect(input.map((b) => b.startAt)).toEqual([60 * MIN, 0]);
  });
});

describe("detectConflicts", () => {
  it("returns overlapping pairs and ignores touching blocks", () => {
    const a = block(0, 60);
    const b = block(30, 90);
    const c = block(90, 120);
    expect(detectConflicts([c, a, b])).toEqual([[a, b]]);
  });

  it("returns an empty array when nothing overlaps", () => {
    expect(detectConflicts([block(0, 30), block(30, 60)])).toEqual([]);
  });
});

describe("findFreeSlots", () => {
  it("returns gaps between blocks within the day window", () => {
    const slots = findFreeSlots([block(120, 180)], 60 * MIN, 240 * MIN);
    expect(slots).toEqual([block(60, 120), block(180, 240)]);
  });

  it("merges overlapping blocks and clamps to the window", () => {
    const slots = findFreeSlots([block(0, 90), block(60, 150)], 0, 240 * MIN);
    expect(slots).toEqual([block(150, 240)]);
  });

  it("filters out gaps shorter than minMinutes", () => {
    const slots = findFreeSlots([block(20, 25)], 0, 60 * MIN, 30);
    expect(slots).toEqual([block(25, 60)]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/scheduling/scheduling.helpers.test.ts`
Expected: FAIL — cannot resolve `./scheduling.helpers`.

- [ ] **Step 3: Write the implementation** — create `packages/core/src/scheduling/scheduling.types.ts`:

```ts
/** A time interval in epoch milliseconds. `endAt` is exclusive. */
export interface TimeBlock {
  startAt: number;
  endAt: number;
}
```

Then create `packages/core/src/scheduling/scheduling.helpers.ts`:

```ts
import type { TimeBlock } from "./scheduling.types";

/** True when the block has a positive duration (`endAt` strictly after `startAt`). */
export function isValidBlock(block: TimeBlock): boolean {
  return block.endAt > block.startAt;
}

/** Duration of the block in whole minutes (floored). */
export function getDurationMinutes(block: TimeBlock): number {
  return Math.floor((block.endAt - block.startAt) / 60000);
}

/** True when two blocks overlap on the half-open interval [startAt, endAt). Touching edges do not overlap. */
export function blocksOverlap(a: TimeBlock, b: TimeBlock): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

/** Returns a new array sorted by `startAt` ascending (ties broken by `endAt`). Does not mutate the input. */
export function sortBlocksByStart<T extends TimeBlock>(blocks: T[]): T[] {
  return [...blocks].sort((a, b) => a.startAt - b.startAt || a.endAt - b.endAt);
}

/** Returns every pair of overlapping blocks as [earlier, later] tuples ordered by start. */
export function detectConflicts<T extends TimeBlock>(blocks: T[]): [T, T][] {
  const sorted = sortBlocksByStart(blocks);
  const conflicts: [T, T][] = [];

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    if (!a) {
      continue;
    }
    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j];
      if (!b) {
        continue;
      }
      if (b.startAt >= a.endAt) {
        break;
      }
      if (blocksOverlap(a, b)) {
        conflicts.push([a, b]);
      }
    }
  }

  return conflicts;
}

/**
 * Returns the free gaps within [dayStart, dayEnd) not covered by any block. Blocks are clamped
 * to the window and merged. When `minMinutes` is given, only gaps at least that long are returned.
 */
export function findFreeSlots(
  blocks: TimeBlock[],
  dayStart: number,
  dayEnd: number,
  minMinutes = 0,
): TimeBlock[] {
  const minMs = minMinutes * 60000;
  const slots: TimeBlock[] = [];

  const clamped = blocks
    .map((b) => ({ startAt: Math.max(b.startAt, dayStart), endAt: Math.min(b.endAt, dayEnd) }))
    .filter((b) => b.endAt > b.startAt);
  const sorted = sortBlocksByStart(clamped);

  let cursor = dayStart;
  for (const b of sorted) {
    if (b.startAt > cursor && b.startAt - cursor >= minMs) {
      slots.push({ startAt: cursor, endAt: b.startAt });
    }
    cursor = Math.max(cursor, b.endAt);
  }
  if (dayEnd > cursor && dayEnd - cursor >= minMs) {
    slots.push({ startAt: cursor, endAt: dayEnd });
  }

  return slots;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/scheduling/scheduling.helpers.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/scheduling/
git commit -m "feat(core): add scheduling time-block helpers (overlap, conflicts, free slots)"
git push
```

---

### Task 3: Task status state machine

**Files:**
- Create: `packages/core/src/features/tasks/tasks.rules.ts`
- Test: `packages/core/src/features/tasks/tasks.rules.test.ts`

**Interfaces:**
- Consumes: `TaskStatus` from `./tasks.types` (`"inbox" | "planned" | "done" | "deferred" | "cancelled"`).
- Produces: `TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]>`, `getAllowedTransitions(from: TaskStatus): TaskStatus[]`, `canTransition(from: TaskStatus, to: TaskStatus): boolean`.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/features/tasks/tasks.rules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { canTransition, getAllowedTransitions, TASK_STATUS_TRANSITIONS } from "./tasks.rules";

describe("canTransition", () => {
  it("allows inbox to planned and cancelled", () => {
    expect(canTransition("inbox", "planned")).toBe(true);
    expect(canTransition("inbox", "cancelled")).toBe(true);
  });

  it("allows reopening a done task to planned", () => {
    expect(canTransition("done", "planned")).toBe(true);
  });

  it("allows reactivating a cancelled task to inbox", () => {
    expect(canTransition("cancelled", "inbox")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(canTransition("inbox", "done")).toBe(false);
    expect(canTransition("done", "inbox")).toBe(false);
    expect(canTransition("cancelled", "planned")).toBe(false);
  });

  it("treats a same-status move as not a transition", () => {
    expect(canTransition("planned", "planned")).toBe(false);
  });
});

describe("getAllowedTransitions", () => {
  it("returns the configured targets for a status", () => {
    expect(getAllowedTransitions("planned")).toEqual(["inbox", "done", "deferred", "cancelled"]);
  });
});

describe("TASK_STATUS_TRANSITIONS", () => {
  it("defines an entry for every status", () => {
    expect(Object.keys(TASK_STATUS_TRANSITIONS).sort()).toEqual([
      "cancelled",
      "deferred",
      "done",
      "inbox",
      "planned",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/features/tasks/tasks.rules.test.ts`
Expected: FAIL — cannot resolve `./tasks.rules`.

- [ ] **Step 3: Write the implementation** — create `packages/core/src/features/tasks/tasks.rules.ts`:

```ts
import type { TaskStatus } from "./tasks.types";

/** Allowed status transitions: each status maps to the statuses it may move to. */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  inbox: ["planned", "cancelled"],
  planned: ["inbox", "done", "deferred", "cancelled"],
  deferred: ["planned", "inbox", "cancelled"],
  done: ["planned"],
  cancelled: ["inbox"],
};

/** The statuses `from` may transition into. */
export function getAllowedTransitions(from: TaskStatus): TaskStatus[] {
  return TASK_STATUS_TRANSITIONS[from];
}

/** True when moving from `from` to `to` is legal. A no-op (`from === to`) is not a transition. */
export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) {
    return false;
  }
  return TASK_STATUS_TRANSITIONS[from].includes(to);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/features/tasks/tasks.rules.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/features/tasks/tasks.rules.ts packages/core/src/features/tasks/tasks.rules.test.ts
git commit -m "feat(core): add strict task status transition rules"
git push
```

---

### Task 4: Validation common schemas

**Files:**
- Create: `packages/core/src/validation/common.ts`
- Test: `packages/core/src/validation/common.test.ts`

**Interfaces:**
- Produces: `idSchema` (zod schema for a non-empty string), `isoDateStringSchema` (zod schema for a real `YYYY-MM-DD` date). Both consumed by Tasks 6, 7, 9.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/validation/common.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { idSchema, isoDateStringSchema } from "./common";

describe("idSchema", () => {
  it("accepts a non-empty string and rejects empty", () => {
    expect(idSchema.parse("role-1")).toBe("role-1");
    expect(() => idSchema.parse("")).toThrow();
  });
});

describe("isoDateStringSchema", () => {
  it("accepts a real YYYY-MM-DD date", () => {
    expect(isoDateStringSchema.parse("2026-05-27")).toBe("2026-05-27");
  });

  it("rejects malformed or impossible dates", () => {
    expect(() => isoDateStringSchema.parse("2026-13-01")).toThrow();
    expect(() => isoDateStringSchema.parse("2026-02-30")).toThrow();
    expect(() => isoDateStringSchema.parse("2026-5-7")).toThrow();
    expect(() => isoDateStringSchema.parse("20260527")).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/validation/common.test.ts`
Expected: FAIL — cannot resolve `./common`.

- [ ] **Step 3: Write the implementation** — create `packages/core/src/validation/common.ts`:

```ts
import { z } from "zod";

/** A non-empty identifier string (a Convex document id at the domain boundary). */
export const idSchema = z.string().min(1);

/** A calendar date in "YYYY-MM-DD" form that denotes a real day. */
export const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => {
    const parts = value.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }, "Not a real calendar date");
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/validation/common.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/validation/
git commit -m "feat(core): add shared id and ISO date validation schemas"
git push
```

---

### Task 5: Roles input schema

**Files:**
- Modify: `packages/core/src/features/roles/roles.types.ts`
- Create: `packages/core/src/features/roles/roles.schema.ts`
- Test: `packages/core/src/features/roles/roles.schema.test.ts`

**Interfaces:**
- Produces: `RoleInput { name: string; description?: string; sortOrder: number }`, `roleInputSchema: z.ZodType<RoleInput>`.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/features/roles/roles.schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { roleInputSchema } from "./roles.schema";

describe("roleInputSchema", () => {
  it("parses a valid role input", () => {
    expect(
      roleInputSchema.parse({ name: "Parent", description: "Family role", sortOrder: 0 }),
    ).toEqual({ name: "Parent", description: "Family role", sortOrder: 0 });
  });

  it("rejects an empty name", () => {
    expect(() => roleInputSchema.parse({ name: "   ", sortOrder: 0 })).toThrow();
  });

  it("rejects a missing sortOrder", () => {
    expect(() => roleInputSchema.parse({ name: "Parent" })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/features/roles/roles.schema.test.ts`
Expected: FAIL — cannot resolve `./roles.schema`.

- [ ] **Step 3: Write the implementation** — append to `packages/core/src/features/roles/roles.types.ts` (keep the existing `Role` interface):

```ts
export interface RoleInput {
  name: string;
  description?: string;
  sortOrder: number;
}
```

Then create `packages/core/src/features/roles/roles.schema.ts`:

```ts
import { z } from "zod";

import type { RoleInput } from "./roles.types";

export const roleInputSchema: z.ZodType<RoleInput> = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  sortOrder: z.number(),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/features/roles/roles.schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/features/roles/
git commit -m "feat(core): add role input type and validation schema"
git push
```

---

### Task 6: Goals input schema

**Files:**
- Modify: `packages/core/src/features/goals/goals.types.ts`
- Create: `packages/core/src/features/goals/goals.schema.ts`
- Test: `packages/core/src/features/goals/goals.schema.test.ts`

**Interfaces:**
- Consumes: `idSchema` from `../../validation/common`; `GoalHorizon`, `GoalStatus` from `./goals.types`.
- Produces: `GoalInput { title: string; description?: string; horizon: GoalHorizon; roleId?: string; status: GoalStatus }`, `goalInputSchema: z.ZodType<GoalInput>`.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/features/goals/goals.schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { goalInputSchema } from "./goals.schema";

describe("goalInputSchema", () => {
  it("parses a valid goal input", () => {
    expect(
      goalInputSchema.parse({
        title: "Run a half marathon",
        horizon: "yearly",
        roleId: "role-1",
        status: "active",
      }),
    ).toEqual({
      title: "Run a half marathon",
      horizon: "yearly",
      roleId: "role-1",
      status: "active",
    });
  });

  it("rejects an invalid horizon", () => {
    expect(() =>
      goalInputSchema.parse({ title: "x", horizon: "daily", status: "active" }),
    ).toThrow();
  });

  it("rejects an empty roleId when provided", () => {
    expect(() =>
      goalInputSchema.parse({ title: "x", horizon: "weekly", roleId: "", status: "active" }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/features/goals/goals.schema.test.ts`
Expected: FAIL — cannot resolve `./goals.schema`.

- [ ] **Step 3: Write the implementation** — append to `packages/core/src/features/goals/goals.types.ts` (keep the existing `GoalHorizon`, `GoalStatus`, `Goal`):

```ts
export interface GoalInput {
  title: string;
  description?: string;
  horizon: GoalHorizon;
  roleId?: string;
  status: GoalStatus;
}
```

Then create `packages/core/src/features/goals/goals.schema.ts`:

```ts
import { z } from "zod";

import { idSchema } from "../../validation/common";
import type { GoalInput } from "./goals.types";

export const goalInputSchema: z.ZodType<GoalInput> = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  horizon: z.enum(["yearly", "monthly", "weekly"]),
  roleId: idSchema.optional(),
  status: z.enum(["active", "completed", "archived"]),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/features/goals/goals.schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/features/goals/
git commit -m "feat(core): add goal input type and validation schema"
git push
```

---

### Task 7: Review input schema

**Files:**
- Modify: `packages/core/src/features/review/review.types.ts`
- Create: `packages/core/src/features/review/review.schema.ts`
- Test: `packages/core/src/features/review/review.schema.test.ts`

**Interfaces:**
- Consumes: `isoDateStringSchema` from `../../validation/common`; `ReviewPeriodType` from `./review.types`.
- Produces: `ReviewInput { periodType: ReviewPeriodType; periodStartDate: string; wins?: string; misses?: string; lessons?: string; nextAdjustments?: string }`, `reviewInputSchema: z.ZodType<ReviewInput>`.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/features/review/review.schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { reviewInputSchema } from "./review.schema";

describe("reviewInputSchema", () => {
  it("parses a valid review input", () => {
    expect(
      reviewInputSchema.parse({
        periodType: "weekly",
        periodStartDate: "2026-05-25",
        wins: "Protected Q2 time",
      }),
    ).toEqual({ periodType: "weekly", periodStartDate: "2026-05-25", wins: "Protected Q2 time" });
  });

  it("rejects an invalid period date", () => {
    expect(() =>
      reviewInputSchema.parse({ periodType: "weekly", periodStartDate: "2026-13-01" }),
    ).toThrow();
  });

  it("rejects an invalid period type", () => {
    expect(() =>
      reviewInputSchema.parse({ periodType: "daily", periodStartDate: "2026-05-25" }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/features/review/review.schema.test.ts`
Expected: FAIL — cannot resolve `./review.schema`.

- [ ] **Step 3: Write the implementation** — append to `packages/core/src/features/review/review.types.ts` (keep the existing `ReviewPeriodType`):

```ts
export interface ReviewInput {
  periodType: ReviewPeriodType;
  periodStartDate: string;
  wins?: string;
  misses?: string;
  lessons?: string;
  nextAdjustments?: string;
}
```

Then create `packages/core/src/features/review/review.schema.ts`:

```ts
import { z } from "zod";

import { isoDateStringSchema } from "../../validation/common";
import type { ReviewInput } from "./review.types";

export const reviewInputSchema: z.ZodType<ReviewInput> = z.object({
  periodType: z.enum(["weekly", "monthly", "yearly"]),
  periodStartDate: isoDateStringSchema,
  wins: z.string().optional(),
  misses: z.string().optional(),
  lessons: z.string().optional(),
  nextAdjustments: z.string().optional(),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/features/review/review.schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/features/review/
git commit -m "feat(core): add review input type and validation schema"
git push
```

---

### Task 8: Planner big-rock rule

**Files:**
- Modify: `packages/core/src/features/planner/planner.types.ts`
- Create: `packages/core/src/features/planner/planner.rules.ts`
- Test: `packages/core/src/features/planner/planner.rules.test.ts`

**Interfaces:**
- Produces (types): `WeeklyPlanInput { weekStartDate: string; selectedRoleIds: string[]; bigRockTaskIds: string[]; status: WeeklyPlanStatus }`, `ScheduleBlockInput { taskId?: string; title?: string; startAt: number; endAt: number; date: string; source: ScheduleSource }` (consumed by Task 9).
- Produces (rules): `BIG_ROCK_SOFT_LIMIT = 6`, `BigRockEvaluation { count: number; withinRecommended: boolean; warning?: string }`, `evaluateBigRocks(taskIds: string[]): BigRockEvaluation`.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/features/planner/planner.rules.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { BIG_ROCK_SOFT_LIMIT, evaluateBigRocks } from "./planner.rules";

describe("evaluateBigRocks", () => {
  it("is within the recommendation at exactly the limit", () => {
    const ids = Array.from({ length: BIG_ROCK_SOFT_LIMIT }, (_, i) => `task-${i}`);
    const result = evaluateBigRocks(ids);
    expect(result.count).toBe(BIG_ROCK_SOFT_LIMIT);
    expect(result.withinRecommended).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("warns but does not block above the limit", () => {
    const ids = Array.from({ length: BIG_ROCK_SOFT_LIMIT + 1 }, (_, i) => `task-${i}`);
    const result = evaluateBigRocks(ids);
    expect(result.withinRecommended).toBe(false);
    expect(result.warning).toContain(String(BIG_ROCK_SOFT_LIMIT + 1));
  });

  it("handles an empty selection", () => {
    expect(evaluateBigRocks([])).toEqual({ count: 0, withinRecommended: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/features/planner/planner.rules.test.ts`
Expected: FAIL — cannot resolve `./planner.rules`.

- [ ] **Step 3: Write the implementation** — append to `packages/core/src/features/planner/planner.types.ts` (keep the existing `WeeklyPlanStatus`, `ScheduleSource`):

```ts
export interface WeeklyPlanInput {
  weekStartDate: string;
  selectedRoleIds: string[];
  bigRockTaskIds: string[];
  status: WeeklyPlanStatus;
}

export interface ScheduleBlockInput {
  taskId?: string;
  title?: string;
  startAt: number;
  endAt: number;
  date: string;
  source: ScheduleSource;
}
```

Then create `packages/core/src/features/planner/planner.rules.ts`:

```ts
/** Recommended maximum number of big-rock (Q2) tasks to commit to in a single week. */
export const BIG_ROCK_SOFT_LIMIT = 6;

export interface BigRockEvaluation {
  count: number;
  withinRecommended: boolean;
  warning?: string;
}

/**
 * Evaluates a week's chosen big-rock task ids against the soft recommendation. Never blocks:
 * returns a `warning` when the count exceeds BIG_ROCK_SOFT_LIMIT so callers can surface guidance
 * while still allowing the selection.
 */
export function evaluateBigRocks(taskIds: string[]): BigRockEvaluation {
  const count = taskIds.length;
  const withinRecommended = count <= BIG_ROCK_SOFT_LIMIT;

  if (withinRecommended) {
    return { count, withinRecommended };
  }

  return {
    count,
    withinRecommended,
    warning: `You selected ${count} big rocks; the recommended weekly limit is ${BIG_ROCK_SOFT_LIMIT}.`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/features/planner/planner.rules.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/features/planner/planner.types.ts packages/core/src/features/planner/planner.rules.ts packages/core/src/features/planner/planner.rules.test.ts
git commit -m "feat(core): add weekly plan input types and big-rock soft-limit rule"
git push
```

---

### Task 9: Planner input schemas

**Files:**
- Create: `packages/core/src/features/planner/planner.schema.ts`
- Test: `packages/core/src/features/planner/planner.schema.test.ts`

**Interfaces:**
- Consumes: `idSchema`, `isoDateStringSchema` from `../../validation/common`; `WeeklyPlanInput`, `ScheduleBlockInput` from `./planner.types` (Task 8).
- Produces: `weeklyPlanInputSchema: z.ZodType<WeeklyPlanInput>`, `scheduleBlockInputSchema: z.ZodType<ScheduleBlockInput>`.

- [ ] **Step 1: Write the failing test** — create `packages/core/src/features/planner/planner.schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { scheduleBlockInputSchema, weeklyPlanInputSchema } from "./planner.schema";

describe("weeklyPlanInputSchema", () => {
  it("parses a valid weekly plan input", () => {
    const input = {
      weekStartDate: "2026-05-25",
      selectedRoleIds: ["role-1", "role-2"],
      bigRockTaskIds: ["task-1"],
      status: "draft" as const,
    };
    expect(weeklyPlanInputSchema.parse(input)).toEqual(input);
  });

  it("rejects an invalid week start date", () => {
    expect(() =>
      weeklyPlanInputSchema.parse({
        weekStartDate: "2026-99-99",
        selectedRoleIds: [],
        bigRockTaskIds: [],
        status: "draft",
      }),
    ).toThrow();
  });
});

describe("scheduleBlockInputSchema", () => {
  it("parses a valid schedule block input", () => {
    const input = {
      taskId: "task-1",
      startAt: 1000,
      endAt: 2000,
      date: "2026-05-25",
      source: "weeklyPlan" as const,
    };
    expect(scheduleBlockInputSchema.parse(input)).toEqual(input);
  });

  it("rejects a block whose endAt is not after startAt", () => {
    expect(() =>
      scheduleBlockInputSchema.parse({
        startAt: 2000,
        endAt: 2000,
        date: "2026-05-25",
        source: "manual",
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @seven-habits/core test src/features/planner/planner.schema.test.ts`
Expected: FAIL — cannot resolve `./planner.schema`.

- [ ] **Step 3: Write the implementation** — create `packages/core/src/features/planner/planner.schema.ts`:

```ts
import { z } from "zod";

import { idSchema, isoDateStringSchema } from "../../validation/common";
import type { ScheduleBlockInput, WeeklyPlanInput } from "./planner.types";

export const weeklyPlanInputSchema: z.ZodType<WeeklyPlanInput> = z.object({
  weekStartDate: isoDateStringSchema,
  selectedRoleIds: z.array(idSchema),
  bigRockTaskIds: z.array(idSchema),
  status: z.enum(["draft", "active", "completed"]),
});

export const scheduleBlockInputSchema: z.ZodType<ScheduleBlockInput> = z
  .object({
    taskId: idSchema.optional(),
    title: z.string().optional(),
    startAt: z.number(),
    endAt: z.number(),
    date: isoDateStringSchema,
    source: z.enum(["weeklyPlan", "dailyPlan", "manual"]),
  })
  .refine((block) => block.endAt > block.startAt, {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @seven-habits/core test src/features/planner/planner.schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit and push**

```bash
git add packages/core/src/features/planner/planner.schema.ts packages/core/src/features/planner/planner.schema.test.ts
git commit -m "feat(core): add weekly plan and schedule block validation schemas"
git push
```

---

### Task 10: Export barrel and full verification

**Files:**
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: every symbol produced in Tasks 1–9.
- Produces: the public surface of `@seven-habits/core`.

- [ ] **Step 1: Replace the full contents of `packages/core/src/index.ts` with:**

```ts
export type { Importance, Quadrant, Urgency } from "./features/matrix/matrix.types";
export { getQuadrant, isQ2Task } from "./features/matrix/matrix.rules";

export type { TaskInput, TaskStatus } from "./features/tasks/tasks.types";
export { taskInputSchema } from "./features/tasks/tasks.schema";
export {
  canTransition,
  getAllowedTransitions,
  TASK_STATUS_TRANSITIONS,
} from "./features/tasks/tasks.rules";

export type { Role, RoleInput } from "./features/roles/roles.types";
export { roleInputSchema } from "./features/roles/roles.schema";

export type { Goal, GoalHorizon, GoalInput, GoalStatus } from "./features/goals/goals.types";
export { goalInputSchema } from "./features/goals/goals.schema";

export type {
  ScheduleBlockInput,
  ScheduleSource,
  WeeklyPlanInput,
  WeeklyPlanStatus,
} from "./features/planner/planner.types";
export type { BigRockEvaluation } from "./features/planner/planner.rules";
export { BIG_ROCK_SOFT_LIMIT, evaluateBigRocks } from "./features/planner/planner.rules";
export {
  scheduleBlockInputSchema,
  weeklyPlanInputSchema,
} from "./features/planner/planner.schema";

export type { ReviewInput, ReviewPeriodType } from "./features/review/review.types";
export { reviewInputSchema } from "./features/review/review.schema";

export type { WeekStartsOn } from "./date/week.helpers";
export {
  addDays,
  addWeeks,
  getWeekDays,
  getWeekRange,
  getWeekStartDate,
  isSameWeek,
  parseISODate,
  toISODateString,
} from "./date/week.helpers";

export type { TimeBlock } from "./scheduling/scheduling.types";
export {
  blocksOverlap,
  detectConflicts,
  findFreeSlots,
  getDurationMinutes,
  isValidBlock,
  sortBlocksByStart,
} from "./scheduling/scheduling.helpers";

export { idSchema, isoDateStringSchema } from "./validation/common";
```

- [ ] **Step 2: Run the full test suite**

Run: `pnpm --filter @seven-habits/core test`
Expected: PASS — every test file green.

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @seven-habits/core typecheck`
Expected: PASS — no `tsc` errors (confirms every barrel export resolves and schema types match their `*Input` types).

- [ ] **Step 4: Commit and push**

```bash
git add packages/core/src/index.ts
git commit -m "feat(core): export new domain rules, schemas, and helpers from barrel"
git push
```

---

## Self-Review

**1. Spec coverage** — every spec work item maps to a task:
- Date helpers (getWeekRange/getWeekDays/addDays/addWeeks/isSameWeek/parseISODate) → Task 1.
- Scheduling helpers (TimeBlock, isValidBlock, getDurationMinutes, blocksOverlap, sortBlocksByStart, detectConflicts, findFreeSlots) → Task 2.
- Strict task status state machine (canTransition/getAllowedTransitions/TASK_STATUS_TRANSITIONS) → Task 3.
- `validation/common.ts` (isoDateStringSchema, idSchema) → Task 4.
- roles/goals/review schemas → Tasks 5/6/7.
- Planner big-rock soft limit (BIG_ROCK_SOFT_LIMIT=6, evaluateBigRocks) + planner input types → Task 8.
- Planner schemas (weeklyPlanInputSchema, scheduleBlockInputSchema) → Task 9.
- Barrel export + DoD (`test` + `typecheck` green) → Task 10.
- Out-of-scope (backend wiring, UI, Clerk/Convex) correctly excluded.

**2. Placeholder scan** — no TBD/TODO/"add error handling"/"similar to Task N"; every code step contains complete code.

**3. Type consistency** — `XInput` type names match between the producing task and its schema (`RoleInput`/`roleInputSchema`, `GoalInput`/`goalInputSchema`, `ReviewInput`/`reviewInputSchema`, `WeeklyPlanInput`+`ScheduleBlockInput`/planner schemas). `idSchema`/`isoDateStringSchema` produced in Task 4 are consumed with identical names in Tasks 6/7/9. Barrel (Task 10) re-exports exactly the symbols each task produces. `BigRockEvaluation` defined and exported consistently.
