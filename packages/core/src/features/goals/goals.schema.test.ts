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
