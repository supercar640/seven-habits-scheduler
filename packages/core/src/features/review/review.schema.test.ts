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
