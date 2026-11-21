#!/usr/bin/env bun
/** Aggregates local eval summaries into a results table and ID-independent metrics. Dev-only. */
import type { CollectionSummary } from "./eval-collect";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";
import { markdownRow } from "./eval-collect";

export interface ReportMetrics {
  totalScenarios: number;
  summaryCount: number;
  scenariosWithCompletedSkill: { run1: number; run2: number; anyRun: number };
  scenariosWithCompletedSubagent: { run1: number; run2: number; anyRun: number };
  totalFailedSkillIDs: number;
  totalFailedSubagentIDs: number;
  failedSkillIDs: string[];
  failedSubagentIDs: string[];
  controlScenario10ZeroCalls: boolean | null;
  disagreeingScenarios: number[];
  incompleteChildCoverageScenarios: number[];
  failedNonTargetTools: Array<{ scenario: number; run: number; names: string[] }>;
  runsWithAnalysisFailures: Array<{ scenario: number; run: number; problem: string }>;
  excludedRunCount: number;
}

/** Builds metrics from summaries without matching any scenario by ID. */
export function buildMetrics(summaries: CollectionSummary[]): ReportMetrics {
  const reliable = summaries.filter(summary => summary.failures.length === 0);
  const runsWithAnalysisFailures = summaries
    .filter(summary => summary.failures.length > 0)
    .map(summary => ({
      scenario: summary.scenario,
      run: summary.run,
      problem: summary.failures.map(failure => failure.problem).join("; "),
    }));
  const skill = { run1: 0, run2: 0, anyRun: 0 };
  const subagent = { run1: 0, run2: 0, anyRun: 0 };
  const failedSkill = new Set<string>();
  const failedSubagent = new Set<string>();
  const incompleteCoverage = new Set<number>();
  const failedNonTargetTools: Array<{ scenario: number; run: number; names: string[] }> = [];
  const byScenario = new Map<number, Map<number, CollectionSummary>>();
  for (const summary of reliable) {
    if (summary.childCoverage === "incomplete") {
      incompleteCoverage.add(summary.scenario);
    }
    const nonTarget = Object.keys(summary.failedCallsByToolName)
      .filter(name => name !== "skill" && name !== "subagent")
      .sort();
    if (nonTarget.length > 0) {
      failedNonTargetTools.push({ scenario: summary.scenario, run: summary.run, names: nonTarget });
    }
    const runs = byScenario.get(summary.scenario) ?? new Map<number, CollectionSummary>();
    runs.set(summary.run, summary);
    byScenario.set(summary.scenario, runs);
    for (const record of summary.failedSkillIDs) {
      failedSkill.add(record.id);
    }
    for (const record of summary.failedSubagentIDs) {
      failedSubagent.add(record.id);
    }
  }
  const disagreeingScenarios: number[] = [];
  for (let scenario = 1; scenario <= 10; scenario++) {
    const runs = byScenario.get(scenario);
    const first = runs?.get(1);
    const second = runs?.get(2);
    const signature = (summary: CollectionSummary | undefined): string => {
      if (!summary) {
        return "missing";
      }
      return `${summary.completedSkillIDs.length > 0}/${summary.completedSubagentIDs.length > 0}`;
    };
    const firstSignature = signature(first);
    const secondSignature = signature(second);
    if (firstSignature !== "missing" && secondSignature !== "missing" && firstSignature !== secondSignature) {
      disagreeingScenarios.push(scenario);
    }
    if (firstSignature !== "missing" && firstSignature.startsWith("true")) {
      skill.run1++;
    }
    if (secondSignature !== "missing" && secondSignature.startsWith("true")) {
      skill.run2++;
    }
    if ((firstSignature !== "missing" && firstSignature.startsWith("true"))
      || (secondSignature !== "missing" && secondSignature.startsWith("true"))) {
      skill.anyRun++;
    }
    if (firstSignature !== "missing" && firstSignature.endsWith("true")) {
      subagent.run1++;
    }
    if (secondSignature !== "missing" && secondSignature.endsWith("true")) {
      subagent.run2++;
    }
    if ((firstSignature !== "missing" && firstSignature.endsWith("true"))
      || (secondSignature !== "missing" && secondSignature.endsWith("true"))) {
      subagent.anyRun++;
    }
  }
  const control = byScenario.get(10);
  const controlSummaries = control ? [...control.values()] : [];
  const controlScenario10ZeroCalls = controlSummaries.length === 0
    ? null
    : controlSummaries.every(summary =>
        summary.completedSkillIDs.length === 0 && summary.completedSubagentIDs.length === 0);
  return {
    totalScenarios: 10,
    summaryCount: summaries.length,
    scenariosWithCompletedSkill: skill,
    scenariosWithCompletedSubagent: subagent,
    totalFailedSkillIDs: failedSkill.size,
    totalFailedSubagentIDs: failedSubagent.size,
    failedSkillIDs: [...failedSkill].sort(),
    failedSubagentIDs: [...failedSubagent].sort(),
    controlScenario10ZeroCalls,
    disagreeingScenarios,
    incompleteChildCoverageScenarios: [...incompleteCoverage].sort((left, right) => left - right),
    failedNonTargetTools,
    runsWithAnalysisFailures,
    excludedRunCount: summaries.length - reliable.length,
  };
}

/** Renders the full Markdown results table in baseline.md column order. */
export function renderTable(summaries: CollectionSummary[]): string {
  const header = "| Scenario | Run (1/2) | Primary agent (build/plan) | Session ID | Skill calls (IDs) | Subagent calls (IDs) | Failed IDs | Child sessions exported? | Notes |";
  const divider = "|---|---|---|---|---|---|---|---|---|";
  const rows = [...summaries]
    .sort((left, right) => left.scenario - right.scenario || left.run - right.run)
    .map(summary => markdownRow(summary));
  return [header, divider, ...rows].join("\n");
}

function idText(ids: string[]): string {
  return ids.length > 0 ? ids.join(", ") : "none";
}

/** Renders the aggregate metrics as plain text. */
export function renderMetrics(metrics: ReportMetrics): string {
  const control = metrics.controlScenario10ZeroCalls === null
    ? "not observed"
    : metrics.controlScenario10ZeroCalls ? "yes" : "no";
  const coverage = metrics.incompleteChildCoverageScenarios.length
    ? metrics.incompleteChildCoverageScenarios.join(", ")
    : "none";
  const nonTarget = metrics.failedNonTargetTools.length
    ? metrics.failedNonTargetTools.map(item => `${item.scenario}/run${item.run}:${item.names.join(",")}`).join("; ")
    : "none";
  const excluded = `excluded/unreliable runs: ${metrics.excludedRunCount}`;
  const failures = metrics.runsWithAnalysisFailures.length === 0
    ? ["Runs with analysis failures: none"]
    : [
        `Runs with analysis failures: ${metrics.runsWithAnalysisFailures.length}`,
        ...metrics.runsWithAnalysisFailures.map(item =>
          `  scenario ${item.scenario} run ${item.run}: ${item.problem}`),
      ];
  const skill = metrics.scenariosWithCompletedSkill;
  const subagent = metrics.scenariosWithCompletedSubagent;
  const skillCounts = `run 1 ${skill.run1}/${metrics.totalScenarios}, run 2 ${skill.run2}/${metrics.totalScenarios}, any run ${skill.anyRun}/${metrics.totalScenarios}`;
  const subagentCounts = `run 1 ${subagent.run1}/${metrics.totalScenarios}, run 2 ${subagent.run2}/${metrics.totalScenarios}, any run ${subagent.anyRun}/${metrics.totalScenarios}`;
  return [
    ...failures,
    `Excluded/unreliable runs (analysis failures): ${metrics.excludedRunCount}`,
    `Scenarios with >=1 completed skill call: ${skillCounts} (${excluded})`,
    `Scenarios with >=1 completed subagent call: ${subagentCounts} (${excluded})`,
    `Failed skill IDs: ${metrics.totalFailedSkillIDs} (${idText(metrics.failedSkillIDs)})`,
    `Failed subagent IDs: ${metrics.totalFailedSubagentIDs} (${idText(metrics.failedSubagentIDs)})`,
    `Control scenario 10 had zero skill/subagent calls: ${control} (${excluded})`,
    `Scenarios where run 1 and run 2 disagree: ${metrics.disagreeingScenarios.length ? metrics.disagreeingScenarios.join(", ") : "none"}`,
    `Scenarios with incomplete child coverage: ${coverage}`,
    `Failed non-target tool calls by scenario: ${nonTarget}`,
  ].join("\n");
}

/** Renders a before/after table of aggregate metrics only. */
export function renderComparison(before: ReportMetrics, after: ReportMetrics): string {
  const rows: Array<[string, string, string]> = [
    ["Completed skill, run 1", `${before.scenariosWithCompletedSkill.run1}/${before.totalScenarios}`, `${after.scenariosWithCompletedSkill.run1}/${after.totalScenarios}`],
    ["Completed skill, run 2", `${before.scenariosWithCompletedSkill.run2}/${before.totalScenarios}`, `${after.scenariosWithCompletedSkill.run2}/${after.totalScenarios}`],
    ["Completed skill, any run", `${before.scenariosWithCompletedSkill.anyRun}/${before.totalScenarios}`, `${after.scenariosWithCompletedSkill.anyRun}/${after.totalScenarios}`],
    ["Completed subagent, run 1", `${before.scenariosWithCompletedSubagent.run1}/${before.totalScenarios}`, `${after.scenariosWithCompletedSubagent.run1}/${after.totalScenarios}`],
    ["Completed subagent, run 2", `${before.scenariosWithCompletedSubagent.run2}/${before.totalScenarios}`, `${after.scenariosWithCompletedSubagent.run2}/${after.totalScenarios}`],
    ["Completed subagent, any run", `${before.scenariosWithCompletedSubagent.anyRun}/${before.totalScenarios}`, `${after.scenariosWithCompletedSubagent.anyRun}/${after.totalScenarios}`],
    ["Failed skill ID count", String(before.totalFailedSkillIDs), String(after.totalFailedSkillIDs)],
    ["Failed subagent ID count", String(before.totalFailedSubagentIDs), String(after.totalFailedSubagentIDs)],
    ["Control scenario 10 zero calls", String(before.controlScenario10ZeroCalls), String(after.controlScenario10ZeroCalls)],
    ["Disagreeing scenarios", String(before.disagreeingScenarios.length), String(after.disagreeingScenarios.length)],
    ["Incomplete child coverage scenarios", String(before.incompleteChildCoverageScenarios.length), String(after.incompleteChildCoverageScenarios.length)],
    ["Failed non-target tool scenarios", String(before.failedNonTargetTools.length), String(after.failedNonTargetTools.length)],
    ["Excluded/unreliable runs", String(before.excludedRunCount), String(after.excludedRunCount)],
  ];
  return ["| Metric | Before | After |", "|---|---|---|", ...rows.map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`)].join("\n");
}

async function loadSummaries(dir: string): Promise<CollectionSummary[]> {
  const files = (await readdir(dir)).filter(file => file.endsWith(".json")).sort();
  const summaries: CollectionSummary[] = [];
  for (const file of files) {
    summaries.push(JSON.parse(await readFile(join(dir, file), "utf8")) as CollectionSummary);
  }
  return summaries;
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const summaryDir = args[0];
  if (!summaryDir) {
    process.stderr.write("usage: bun scripts/eval-report.ts <summary-dir> [--json <out>] [--compare <before.json> <after.json>]\n");
    process.exit(1);
  }
  const jsonIndex = args.indexOf("--json");
  const compareIndex = args.indexOf("--compare");
  try {
    if (compareIndex >= 0) {
      const beforePath = args[compareIndex + 1];
      const afterPath = args[compareIndex + 2];
      if (!beforePath || !afterPath) {
        throw new Error("--compare requires before and after metric files");
      }
      const before = JSON.parse(await readFile(beforePath, "utf8")) as ReportMetrics;
      const after = JSON.parse(await readFile(afterPath, "utf8")) as ReportMetrics;
      process.stdout.write(`${renderComparison(before, after)}\n`);
    }
    else {
      const summaries = await loadSummaries(summaryDir);
      const metrics = buildMetrics(summaries);
      process.stdout.write(`${renderTable(summaries)}\n\n${renderMetrics(metrics)}\n`);
      if (jsonIndex >= 0) {
        const out = args[jsonIndex + 1];
        if (!out) {
          throw new Error("--json requires an output path");
        }
        await mkdir(dirname(out), { recursive: true });
        await writeFile(out, `${JSON.stringify(metrics, null, 2)}\n`);
      }
    }
  }
  catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
