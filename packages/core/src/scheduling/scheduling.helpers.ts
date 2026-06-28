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
