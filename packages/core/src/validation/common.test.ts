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
