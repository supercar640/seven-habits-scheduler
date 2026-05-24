import { describe, expect, it } from "vitest";

import { getWeekStartDate, toISODateString } from "./week.helpers";

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
