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
