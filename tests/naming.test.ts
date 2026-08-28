import { describe, expect, it } from "bun:test";
import { normalizeCommand, isValidSlug } from "../src/lib/naming";

describe("Lib Naming (scule)", () => {
  it("normalizes command file names to slash commands", () => {
    expect(normalizeCommand("ship-pr.md")).toBe("/ship-pr");
    expect(normalizeCommand("ship.md")).toBe("/ship");
    expect(normalizeCommand("cleanBranches.md")).toBe("/clean-branches");
    expect(normalizeCommand("clean-branches.md")).toBe("/clean-branches");
  });

  it("validates agent and skill slug names", () => {
    expect(isValidSlug("research-methodology")).toBe(true);
    expect(isValidSlug("task-decomposition")).toBe(true);
    expect(isValidSlug("Research_Methodology")).toBe(false);
    expect(isValidSlug("research methodology")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});
