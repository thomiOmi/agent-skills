/**
 * Artifact builders for the eval runner, aligned with the vendored skill-creator
 * schemas (.agents/skills/skill-creator/references/schemas.md) so that
 * aggregate_benchmark.py and the eval viewer can consume our run output
 * without conversion. Deterministic assertion grading maps onto the
 * "expectations" concept: each assertion becomes an expectation record with
 * evidence.
 */
import type { Assertion, GradeResult } from "./grading";

export interface ExpectationRecord {
  text: string
  passed: boolean
  evidence: string
}

export function assertionText(assertion: Assertion): string {
  return typeof assertion === "string" ? assertion : assertion.text;
}

export function toExpectations(grade: GradeResult): ExpectationRecord[] {
  return grade.details.map(d => ({
    text: assertionText(d.assertion),
    passed: d.passed,
    evidence: d.passed
      ? "assertion matched in executor output"
      : "assertion not satisfied in executor output",
  }));
}

/** Wall-clock timing for a single run (timing.json / grading.json "timing"). */
export interface RunTiming {
  executor_start: string
  executor_end: string
  executor_duration_seconds: number
  total_duration_seconds: number
}

export function buildTiming(executorStart: Date, executorEnd: Date, resumed = false): RunTiming {
  // Resumed runs grade pre-existing output; the executor wall time is unknown
  // by definition, so it is recorded as 0 rather than fabricated.
  const seconds = resumed ? 0 : (executorEnd.getTime() - executorStart.getTime()) / 1000;
  return {
    executor_start: executorStart.toISOString(),
    executor_end: executorEnd.toISOString(),
    executor_duration_seconds: Math.round(seconds * 10) / 10,
    total_duration_seconds: Math.round(seconds * 10) / 10,
  };
}

/**
 * grading.json per run dir. Tool-call metrics are not available from the
 * executor's plain-text stdout, so tool_calls is recorded as unknown (empty)
 * instead of zeros pretending to be measured data.
 */
export interface GradingJson {
  expectations: ExpectationRecord[]
  summary: {
    passed: number
    failed: number
    total: number
    pass_rate: number
  }
  execution_metrics: {
    tool_calls: Record<string, number>
    total_tool_calls: number
    errors_encountered: number
    output_chars: number
    transcript_chars: number
  }
  timing: RunTiming
  notes?: string[]
}

export function buildGrading(grade: GradeResult, output: string, timing: RunTiming, resumed = false): GradingJson {
  const passRate = grade.total > 0 ? grade.passed / grade.total : 0;
  const grading: GradingJson = {
    expectations: toExpectations(grade),
    summary: {
      passed: grade.passed,
      failed: grade.total - grade.passed,
      total: grade.total,
      pass_rate: Math.round(passRate * 100) / 100,
    },
    execution_metrics: {
      tool_calls: {},
      total_tool_calls: 0,
      errors_encountered: 0,
      output_chars: output.length,
      transcript_chars: output.length,
    },
    timing,
  };
  if (resumed) {
    grading.notes = ["timing unknown: run was graded from pre-existing output (resume)"];
  }
  return grading;
}

/** Sample stddev (n-1), matching aggregate_benchmark.py calculate_stats. */
export function calculateStats(values: number[]): { mean: number, stddev: number, min: number, max: number } {
  const round = (n: number) => Math.round(n * 10000) / 10000;
  if (values.length === 0) {
    return { mean: 0, stddev: 0, min: 0, max: 0 };
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stddev = values.length > 1
    ? Math.sqrt(values.reduce((acc, x) => acc + (x - mean) ** 2, 0) / (values.length - 1))
    : 0;
  return {
    mean: round(mean),
    stddev: round(stddev),
    min: round(Math.min(...values)),
    max: round(Math.max(...values)),
  };
}
export interface BenchmarkRunInput {
  evalId: number
  /** A/B mode name: with_skill/without_skill (skills) or with_agent/without_agent (agents). */
  configuration: string
  grade: GradeResult
  timeSeconds: number
}

/** Per-configuration aggregate stats (calculateStats per metric). */
interface ConfigStats {
  pass_rate: { mean: number }
  time_seconds: { mean: number }
  tokens: { mean: number }
}

/** run_summary keyed by configuration in first-seen order plus the delta block (first config minus second), matching aggregate_benchmark.py. */
function buildRunSummary(
  configNames: string[],
  statsByConfig: Map<string, ConfigStats>,
  delta: (a: number, b: number, digits: number) => string,
): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const [config, stats] of statsByConfig) {
    summary[config] = stats;
  }
  const [primaryConfig, baselineConfig] = configNames;
  const primaryStats = primaryConfig !== undefined ? statsByConfig.get(primaryConfig) : undefined;
  const baselineStats = baselineConfig !== undefined ? statsByConfig.get(baselineConfig) : undefined;
  summary.delta = {
    pass_rate: delta(primaryStats?.pass_rate.mean ?? 0, baselineStats?.pass_rate.mean ?? 0, 2),
    time_seconds: delta(primaryStats?.time_seconds.mean ?? 0, baselineStats?.time_seconds.mean ?? 0, 1),
    tokens: delta(primaryStats?.tokens.mean ?? 0, baselineStats?.tokens.mean ?? 0, 0),
  };
  return summary;
}

/**
 * benchmark.json per iteration, in the exact shape aggregate_benchmark.py
 * generates (field names are consumed verbatim by the eval viewer:
 * "configuration" not "config", pass_rate nested under "result").
 */
export function buildBenchmark(options: {
  skillName: string
  skillPath: string
  executor: string
  runs: BenchmarkRunInput[]
}): object {
  const modelMatch = options.executor.match(/--model\s+(\S+)/);
  const evalIds = [...new Set(options.runs.map(r => r.evalId))].sort((a, b) => a - b);

  const runs = options.runs.map((r) => {
    const passRate = r.grade.total > 0 ? r.grade.passed / r.grade.total : 0;
    return {
      eval_id: r.evalId,
      eval_name: String(r.evalId),
      configuration: r.configuration,
      run_number: 1,
      result: {
        pass_rate: Math.round(passRate * 100) / 100,
        passed: r.grade.passed,
        failed: r.grade.total - r.grade.passed,
        total: r.grade.total,
        time_seconds: Math.round(r.timeSeconds * 10) / 10,
        tokens: 0,
        tool_calls: 0,
        errors: 0,
      },
      expectations: toExpectations(r.grade),
      notes: [],
    };
  });

  const summarize = (config: string) => {
    const configRuns = options.runs.filter(r => r.configuration === config);
    return {
      pass_rate: calculateStats(configRuns.map(r => (r.grade.total > 0 ? r.grade.passed / r.grade.total : 0))),
      time_seconds: calculateStats(configRuns.map(r => r.timeSeconds)),
      tokens: calculateStats(configRuns.map(() => 0)),
    };
  };
  const delta = (a: number, b: number, digits: number) => {
    const d = a - b;
    return `${d >= 0 ? "+" : ""}${d.toFixed(digits)}`;
  };
  const configNames = [...new Set(options.runs.map(r => r.configuration))];
  const statsByConfig = new Map(configNames.map(config => [config, summarize(config)]));

  return {
    metadata: {
      skill_name: options.skillName,
      skill_path: options.skillPath,
      executor_model: modelMatch?.[1] ?? "unknown",
      analyzer_model: "assertion-grading",
      timestamp: new Date().toISOString(),
      evals_run: evalIds,
      runs_per_configuration: 1,
    },
    runs,
    run_summary: buildRunSummary(configNames, statsByConfig, delta),
    notes: [],
  };
}

/** history.json per skill (Improve-mode progression, schemas.md). */
export interface HistoryEntry {
  version: string
  parent: string | null
  expectation_pass_rate: number
  grading_result: "baseline"
  is_current_best: boolean
}

export function nextHistoryEntry(
  iterations: HistoryEntry[],
  version: string,
  passRate: number,
): HistoryEntry {
  return {
    version,
    parent: iterations.at(-1)?.version ?? null,
    expectation_pass_rate: Math.round(passRate * 100) / 100,
    grading_result: "baseline",
    is_current_best: true,
  };
}
