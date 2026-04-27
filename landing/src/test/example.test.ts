import { describe, expect, it } from "vitest";

describe("example", () => {
  it("keeps the Vitest setup active", () => {
    expect(window.matchMedia("(min-width: 1px)").matches).toBe(false);
  });
});
