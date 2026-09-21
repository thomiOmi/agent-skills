import { describe, expect, it } from "bun:test";
import {
  assertionText,
  buildBenchmark,
  buildGrading,
  buildTiming,
  calculateStats,
  nextHistoryEntry,
  toExpectations,
} from "../evals/src/artifacts";
import { gradeOutput } from "../evals/src/grading";

describe("eval artifacts (vendored skill-creator schemas)", () => {
  it("maps assertion details to expectation records with evidence", () => {
    const grade = gradeOutput("reproduce then fix", ["reproduce", "deploy"]);
    const expectations = toExpectations(grade);
    expect(expectations).toHaveLength(2);
    expect(expectations[0]).toEqual({
      text: "reproduce",
      passed: true,
      evidence: "assertion matched in executor output",
    });
    expect(expectations[1]?.passed).toBe(false);
    expect(expectations[1]?.evidence).toContain("not satisfied");
  });

  it("reads text from object assertions", () => {
    expect(assertionText({ text: "BREAKING CHANGE", caseSensitive: true })).toBe("BREAKING CHANGE");
    expect(assertionText("plain")).toBe("plain");
  });

  it("computes executor wall time and zeroes it for resumed runs", () => {
    const start = new Date("2026-01-15T10:30:00Z");
    const end = new Date("2026-01-15T10:32:45Z");
    const timing = buildTiming(start, end);
    expect(timing.executor_duration_seconds).toBe(165);
    expect(timing.total_duration_seconds).toBe(165);
    expect(timing.executor_start).toBe("2026-01-15T10:30:00.000Z");

    const resumed = buildTiming(start, end, true);
    expect(resumed.executor_duration_seconds).toBe(0);
  });

  it("writes grading.json shape with summary, metrics, and timing", () => {
    const grade = gradeOutput("hello world", ["hello", "missing"]);
    const timing = buildTiming(new Date("2026-01-15T10:30:00Z"), new Date("2026-01-15T10:31:00Z"));
    const grading = buildGrading(grade, "hello world output text", timing);
    expect(grading.summary).toEqual({ passed: 1, failed: 1, total: 2, pass_rate: 0.5 });
    expect(grading.expectations).toHaveLength(2);
    expect(grading.execution_metrics.output_chars).toBe("hello world output text".length);
    expect(grading.execution_metrics.total_tool_calls).toBe(0);
    expect(grading.timing.executor_duration_seconds).toBe(60);
    expect(grading.notes).toBeUndefined();
  });

  it("marks resumed gradings with an explicit timing-unknown note", () => {
    const grade = gradeOutput("x", ["x"]);
    const grading = buildGrading(grade, "x", buildTiming(new Date(), new Date(), true), true);
    expect(grading.notes?.[0]).toContain("resume");
  });

  it("calculates sample stddev matching aggregate_benchmark.py", () => {
    expect(calculateStats([1, 2, 3, 4])).toEqual({ mean: 2.5, stddev: 1.291, min: 1, max: 4 });
    expect(calculateStats([5])).toEqual({ mean: 5, stddev: 0, min: 5, max: 5 });
    expect(calculateStats([])).toEqual({ mean: 0, stddev: 0, min: 0, max: 0 });
  });

  it("builds viewer-compatible benchmark.json with nested result and delta strings", () => {
    const withGrade = gradeOutput("a b c d", ["a", "b", "c", "d"]);
    const withoutGrade = gradeOutput("a b", ["a", "b", "c", "d"]);
    const benchmark = buildBenchmark({
      skillName: "git-workflow",
      skillPath: "skills/git-workflow",
      executor: "opencode run --model opencode/mimo-v2.5-free --agent build --auto",
      runs: [
        { evalId: 1, configuration: "with_skill", grade: withGrade, timeSeconds: 10 },
        { evalId: 1, configuration: "without_skill", grade: withoutGrade, timeSeconds: 5 },
      ],
    }) as {
      metadata: {
        executor_model: string
        evals_run: number[]
        runs_per_configuration: number
      }
      runs: {
        configuration: string
        result: {
          pass_rate: number
          passed: number
          failed: number
          total: number
          time_seconds: number
        }
      }[]
      run_summary: {
        with_skill: { pass_rate: { mean: number } }
        without_skill: { pass_rate: { mean: number } }
        delta: { pass_rate: string, time_seconds: string, tokens: string }
      }
    };

    expect(benchmark.metadata.executor_model).toBe("opencode/mimo-v2.5-free");
    expect(benchmark.metadata.evals_run).toEqual([1]);
    expect(benchmark.metadata.runs_per_configuration).toBe(1);
    const withRun = benchmark.runs.find(r => r.configuration === "with_skill");
    const withoutRun = benchmark.runs.find(r => r.configuration === "without_skill");
    expect(withRun).toBeDefined();
    expect(withoutRun).toBeDefined();
    if (!withRun || !withoutRun) {
      return;
    }
    expect(withRun.result.pass_rate).toBe(1);
    expect(withRun.result.passed).toBe(4);
    expect(withRun.result.failed).toBe(0);
    expect(withRun.result.total).toBe(4);
    expect(withRun.result.time_seconds).toBe(10);
    expect(withoutRun.result.pass_rate).toBe(0.5);
    expect(benchmark.run_summary.with_skill.pass_rate.mean).toBe(1);
    expect(benchmark.run_summary.without_skill.pass_rate.mean).toBe(0.5);
    expect(benchmark.run_summary.delta.pass_rate).toBe("+0.50");
    expect(benchmark.run_summary.delta.time_seconds).toBe("+5.0");
    expect(benchmark.run_summary.delta.tokens).toBe("+0");
  });

  it("tracks history progression with parent chain and current best", () => {
    const first = nextHistoryEntry([], "v1", 0.6);
    expect(first).toEqual({
      version: "v1",
      parent: null,
      expectation_pass_rate: 0.6,
      grading_result: "baseline",
      is_current_best: true,
    });
    const second = nextHistoryEntry([first], "v2", 0.8);
    expect(second.parent).toBe("v1");
    expect(second.expectation_pass_rate).toBe(0.8);
    expect(second.is_current_best).toBe(true);
  });
});
