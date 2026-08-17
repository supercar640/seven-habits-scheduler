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
