import { describe, expect, it } from "bun:test";
import { gradeOutput, validateAssertions } from "../evals/src/grading";
import { modesForTarget, resolveEvalTarget } from "../evals/src/targets";

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

  it("matches object assertions case-sensitively when caseSensitive is set", () => {
    // Convention tokens are case-sensitive by definition: "Breaking change:"
    // must not satisfy a BREAKING CHANGE convention check.
    const grade = gradeOutput("## Breaking change\nremoved the v1 API", [
      { text: "BREAKING CHANGE", caseSensitive: true },
    ]);
    expect(grade.passed).toBe(0);
    expect(grade.total).toBe(1);
  });

  it("passes case-sensitive tokens in the exact convention form", () => {
    const grade = gradeOutput("BREAKING CHANGE: removed the v1 API", [
      { text: "BREAKING CHANGE", caseSensitive: true },
    ]);
    expect(grade.passed).toBe(1);
    expect(grade.total).toBe(1);
  });

  it("supports negated assertions for anti-deferral guards", () => {
    // A candidate that only asks for the missing input satisfies keywords but
    // did not do the work; the negated guard keeps deferral from passing.
    const grade = gradeOutput("Could you share the API key so I can check the schema?", [
      "schema",
      { text: "could you", negate: true },
    ]);
    expect(grade.passed).toBe(1);
    expect(grade.total).toBe(2);
    expect(grade.details.find(d => typeof d.assertion === "object" && d.assertion.negate)?.passed).toBe(false);
  });

  it("supports regex assertions with case-insensitive matching by default", () => {
    const grade = gradeOutput("Ran 12 tests, 12 passed", [
      { text: "\\d+ tests?, \\d+ passed", regex: true },
      { text: "^0 failures", regex: true },
    ]);
    expect(grade.passed).toBe(1);
    expect(grade.total).toBe(2);
  });

  it("treats plain strings exactly as before (case-insensitive substring)", () => {
    const grade = gradeOutput("The QuickStart section covers installation", ["quickstart"]);
    expect(grade.passed).toBe(1);
  });
});

describe("eval runner assertion validation", () => {
  it("accepts plain strings without errors", () => {
    expect(validateAssertions(["a", "b"], "test#1")).toEqual([]);
  });

  it("accepts valid object assertions", () => {
    const errors = validateAssertions(
      [
        { text: "BREAKING CHANGE", caseSensitive: true },
        { text: "\\d+ tests", regex: true },
        { text: "could you", negate: true },
        { text: "x", regex: true, negate: true },
      ],
      "test#1",
    );
    expect(errors).toEqual([]);
  });

  it("rejects empty text", () => {
    expect(validateAssertions([{ text: "" }], "test#1").length).toBe(1);
  });

  it("rejects invalid regex patterns", () => {
    const errors = validateAssertions([{ text: "([unclosed", regex: true }], "test#2");
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("invalid regex");
  });

  it("reports the context in validation errors", () => {
    const errors = validateAssertions([{ text: "" }], "git-workflow#3");
    expect(errors[0]).toContain("git-workflow#3");
  });
});

describe("eval target resolution (Fase 4)", () => {
  it("maps skill targets to skill mode pairs", () => {
    expect(modesForTarget("skill")).toEqual(["with_skill", "without_skill"]);
  });

  it("maps agent targets to agent mode pairs", () => {
    expect(modesForTarget("agent")).toEqual(["with_agent", "without_agent"]);
  });

  it("resolves skill targets to the skill directory", () => {
    expect(resolveEvalTarget("code-style", "skill").replace(/\\/g, "/")).toContain("skills/code-style");
  });

  it("resolves agent targets to the agent markdown file", () => {
    expect(resolveEvalTarget("security-auditor", "agent").replace(/\\/g, "/")).toContain("agents/security-auditor.md");
  });
});
