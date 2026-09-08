import { describe, expect, it } from "bun:test";
import { gradeOutput } from "../scripts/evals/run-evals";

describe("eval runner deterministic grading", () => {
  it("passes when all assertion keywords appear in the output", () => {
    const grade = gradeOutput(
      "First reproduce the issue from logs, then form hypotheses and test them one at a time.",
      ["reproduce", "logs", "hypothes"],
    );
    expect(grade.passed).toBe(3);
    expect(grade.total).toBe(3);
    expect(grade.details.every(d => d.passed)).toBe(true);
  });

  it("is case-insensitive and supports partial word stems", () => {
    const grade = gradeOutput("EXPLAIN the plan; check the index", ["explain", "index", "LOCK"]);
    expect(grade.passed).toBe(2);
    expect(grade.total).toBe(3);
    expect(grade.details.find(d => d.assertion === "LOCK")?.passed).toBe(false);
  });

  it("returns zero totals when there are no assertions", () => {
    const grade = gradeOutput("anything", undefined);
    expect(grade.passed).toBe(0);
    expect(grade.total).toBe(0);
    expect(grade.details).toEqual([]);
  });
});
