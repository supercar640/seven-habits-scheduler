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
