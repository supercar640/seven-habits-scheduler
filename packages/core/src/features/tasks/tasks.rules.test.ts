import { describe, expect, it } from "vitest";

import { canTransition, getAllowedTransitions, TASK_STATUS_TRANSITIONS } from "./tasks.rules";

describe("canTransition", () => {
  it("allows inbox to planned and cancelled", () => {
    expect(canTransition("inbox", "planned")).toBe(true);
    expect(canTransition("inbox", "cancelled")).toBe(true);
  });

  it("allows reopening a done task to planned", () => {
    expect(canTransition("done", "planned")).toBe(true);
  });

  it("allows reactivating a cancelled task to inbox", () => {
    expect(canTransition("cancelled", "inbox")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(canTransition("inbox", "done")).toBe(false);
    expect(canTransition("done", "inbox")).toBe(false);
    expect(canTransition("cancelled", "planned")).toBe(false);
  });

  it("treats a same-status move as not a transition", () => {
    expect(canTransition("planned", "planned")).toBe(false);
  });
});

describe("getAllowedTransitions", () => {
  it("returns the configured targets for a status", () => {
    expect(getAllowedTransitions("planned")).toEqual(["inbox", "done", "deferred", "cancelled"]);
  });
});

describe("TASK_STATUS_TRANSITIONS", () => {
  it("defines an entry for every status", () => {
    expect(Object.keys(TASK_STATUS_TRANSITIONS).sort()).toEqual([
      "cancelled",
      "deferred",
      "done",
      "inbox",
      "planned",
    ]);
  });
});
