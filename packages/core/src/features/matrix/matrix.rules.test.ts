import { describe, expect, it } from "vitest";

import { getQuadrant, isQ2Task } from "./matrix.rules";

describe("getQuadrant", () => {
  it("maps high importance and high urgency to Q1", () => {
    expect(getQuadrant("high", "high")).toBe("Q1");
  });

  it("maps high importance and low urgency to Q2", () => {
    expect(getQuadrant("high", "low")).toBe("Q2");
  });

  it("maps low importance and high urgency to Q3", () => {
    expect(getQuadrant("low", "high")).toBe("Q3");
  });

  it("maps low importance and low urgency to Q4", () => {
    expect(getQuadrant("low", "low")).toBe("Q4");
  });
});

describe("isQ2Task", () => {
  it("is true only for high importance and low urgency", () => {
    expect(isQ2Task({ importance: "high", urgency: "low" })).toBe(true);
    expect(isQ2Task({ importance: "high", urgency: "high" })).toBe(false);
    expect(isQ2Task({ importance: "low", urgency: "high" })).toBe(false);
    expect(isQ2Task({ importance: "low", urgency: "low" })).toBe(false);
  });
});
