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
