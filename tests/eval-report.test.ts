import type { CollectionSummary, IDRecord } from "./../scripts/eval-collect";
import type { ReportMetrics } from "./../scripts/eval-report";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { buildMetrics, renderComparison, renderMetrics, renderTable } from "../scripts/eval-report";

function record(id: string): IDRecord {
  return { id, source: "main", sessionID: "ses_synthetic" };
}

function summary(
  scenario: number,
  run: 1 | 2,
  skill: IDRecord[] = [],
  subagent: IDRecord[] = [],
  failedSkill: IDRecord[] = [],
  failedSubagent: IDRecord[] = [],
): CollectionSummary {
  return {
    scenario,
    run,
    sessionID: "ses_synthetic",
    primaryAgent: "build",
    model: "provider/model",
    childSessionCount: 0,
    childSessionsFound: 0,
    childCoverage: "complete",
    completedSubagentCalls: 0,
    failedCallsByToolName: {},
    completedSkillIDs: skill,
    failedSkillIDs: failedSkill,
    completedSubagentIDs: subagent,
    failedSubagentIDs: failedSubagent,
    errors: 0,
    incomplete: 0,
    mismatch: false,
    failures: [],
    zeroToolSessions: [],
  };
}

function fixtures(): CollectionSummary[] {
  return [
    summary(1, 1, [record("skill-a")], [], [record("bad-skill")]),
    summary(1, 2, [], [record("agent-b")]),
    summary(2, 1, [record("skill-c")]),
    {
      ...summary(2, 2, [record("skill-c")]),
      childCoverage: "incomplete" as const,
      failedCallsByToolName: { task: 1 },
    },
    {
      ...summary(3, 1),
      failures: [{ sessionID: "ses_synthetic", problem: "synthetic analysis failure" }],
    },
    summary(3, 2, [record("skill-d")]),
    {
      ...summary(4, 1),
      zeroToolSessions: [{ sessionID: "ses_synthetic", source: "main" }],
    },
    summary(10, 1),
    summary(10, 2),
  ];
}

async function tempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "eval-report-"));
}

async function runCli(args: string[]): Promise<{ code: number; output: string; errors: string }> {
  const child = Bun.spawn(["bun", "scripts/eval-report.ts", ...args], {
    cwd: join(import.meta.dir, ".."),
    stdout: "pipe",
    stderr: "pipe",
  });
  const [output, errors] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code: await child.exited, output, errors };
}

describe("buildMetrics", () => {
  test("counts scenarios by run, failures, control, and disagreements", () => {
    const metrics = buildMetrics(fixtures());
    expect(metrics.scenariosWithCompletedSkill).toEqual({ run1: 2, run2: 2, anyRun: 3 });
    expect(metrics.scenariosWithCompletedSubagent).toEqual({ run1: 0, run2: 1, anyRun: 1 });
    expect(metrics.failedSkillIDs).toEqual(["bad-skill"]);
    expect(metrics.totalFailedSkillIDs).toBe(1);
    expect(metrics.totalFailedSubagentIDs).toBe(0);
    expect(metrics.controlScenario10ZeroCalls).toBe(true);
    expect(metrics.disagreeingScenarios).toEqual([1]);
    expect(metrics.incompleteChildCoverageScenarios).toEqual([2]);
    expect(metrics.failedNonTargetTools).toEqual([{ scenario: 2, run: 2, names: ["task"] }]);
    expect(metrics.runsWithAnalysisFailures).toEqual([
      { scenario: 3, run: 1, problem: "synthetic analysis failure" },
    ]);
    expect(metrics.excludedRunCount).toBe(1);
    expect(metrics.runsWithZeroMainToolCalls).toEqual([{ scenario: 4, run: 1 }]);
    expect(renderMetrics(metrics)).toContain("Runs with zero tool calls in the main session: 4/1");
    expect(renderMetrics(metrics)).toContain("Runs with analysis failures: 1");
    expect(renderMetrics(metrics)).toContain("scenario 3 run 1: synthetic analysis failure");
    expect(renderMetrics(metrics)).toContain("Excluded/unreliable runs (analysis failures): 1");
    expect(renderMetrics(metrics)).toContain("(excluded/unreliable runs: 1)");
    expect(renderMetrics(metrics)).toContain("Scenarios with incomplete child coverage: 2");
    expect(renderMetrics(metrics)).toContain("Failed non-target tool calls by scenario: 2/run2:task");
    expect(renderTable(fixtures())).toContain("| Scenario | Run (1/2) |");
    expect(renderTable(fixtures())).toContain("failedTools=task");
  });

  test("marks control as not observed when scenario 10 is absent", () => {
    expect(buildMetrics([summary(1, 1)]).controlScenario10ZeroCalls).toBeNull();
  });
});

describe("CLI", () => {
  test("prints table and writes JSON metrics with --json", async () => {
    const dir = await tempDir();
    for (const item of fixtures()) {
      await writeFile(join(dir, `${item.scenario}-run${item.run}.json`), JSON.stringify(item));
    }
    const out = join(dir, "metrics.json");
    const result = await runCli([dir, "--json", out]);
    expect(result.code).toBe(0);
    expect(result.output).toContain("| Scenario | Run (1/2) |");
    expect(result.output).toContain("Scenarios with >=1 completed skill call");
    const saved = JSON.parse(await readFile(out, "utf8")) as ReportMetrics;
    expect(saved.disagreeingScenarios).toEqual([1]);
    expect(saved.excludedRunCount).toBe(1);
    expect(saved.runsWithAnalysisFailures.length).toBe(1);
    await rm(dir, { recursive: true, force: true });
  });

  test("prints only a before/after metric table with --compare", async () => {
    const dir = await tempDir();
    const before = join(dir, "before.json");
    const after = join(dir, "after.json");
    await writeFile(before, JSON.stringify(buildMetrics(fixtures())));
    await writeFile(after, JSON.stringify(buildMetrics([summary(1, 1, [record("skill-a")])])));
    const result = await runCli([dir, "--compare", before, after]);
    expect(result.code).toBe(0);
    expect(result.output).toContain("| Metric | Before | After |");
    expect(result.output).toContain("Completed skill, run 1");
    expect(result.output).not.toContain("| Scenario | Run (1/2) |");
    expect(renderComparison(buildMetrics([]), buildMetrics([]))).toContain("Failed subagent ID count");
    await rm(dir, { recursive: true, force: true });
  });
});
