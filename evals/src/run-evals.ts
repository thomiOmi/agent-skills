/**
 * Eval runner for agent skills (agentskills.io eval pattern).
 *
 * Reads eval case definitions from evals/cases/<skill>.json, scaffolds
 * evals/workspace/<skill>/iteration-N/<skill>-<id>/with_skill and
 * without_skill subdirs with prompt.txt, output.txt (executor output), and a
 * graded/ subdir holding expected_output.txt (kept out of the executor cwd to
 * avoid leaking the grading key), plus summary.json. Per run dir it also
 * records graded/grading.json, graded/timing.json and outputs/output.txt in
 * the vendored skill-creator schema shapes, and per skill iteration writes
 * benchmark.json (eval-viewer compatible) and history.json (Improve-mode
 * progression). Executor default:
 * opencode run --model opencode/mimo-v2.5-free --agent build --auto (build
 * agent so candidates execute the task instead of answering in plan mode).
 */
import { defineCommand, runMain } from "citty";
import { mkdir, readdir, readFile, writeFile, cp, stat } from "fs/promises";
import { join, resolve } from "pathe";
import { spawn } from "child_process";
import { consola } from "consola";

import { gradeOutput, GRADING_VERSION, validateAssertions } from "./grading";
import type { GradeResult } from "./grading";
import { buildBenchmark, buildGrading, buildTiming, nextHistoryEntry } from "./artifacts";
import type { BenchmarkRunInput, HistoryEntry, RunTiming } from "./artifacts";
import {
  CASES_DIR,
  DEFAULT_EXECUTOR,
  MODES,
  SKILLS_ROOT,
  WORKSPACE_ROOT,
} from "./targets";
import type { EntryStatus, EvalCase, EvalMode, EvalsFile } from "./targets";

function aggregatePass(items: EntryStatus[]): { passed: number, graded: number } {
  const graded = items.filter(i => i.total > 0);
  return {
    passed: graded.filter(i => i.passed === i.total).length,
    graded: graded.length,
  };
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  }
  catch {
    return false;
  }
}

function caseStem(path: string): string {
  const name = path.replace(/\\/g, "/").split("/").pop() ?? "";
  return name.endsWith(".json") ? name.slice(0, -5) : name;
}

async function findEvalsFiles(): Promise<string[]> {
  if (!(await exists(CASES_DIR))) {
    return [];
  }
  const entries = await readdir(CASES_DIR, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith(".json") || e.name === "evals.example.json") {
      continue;
    }
    out.push(join(CASES_DIR, e.name));
  }
  return out.sort();
}

const PROMPT_TIMEOUT_MS = 15 * 60 * 1000;

function runPrompt(
  command: string,
  args: string[],
  cwd: string,
  promptText: string,
): Promise<{ output: string, startedAt: Date, endedAt: Date }> {
  return new Promise((resolvePromise, reject) => {
    const startedAt = new Date();
    const proc = spawn(command, [...args, promptText], {
      cwd,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    // Kill the executor if it hangs (e.g. provider rate-limit retry loops) so
    // the run can continue to the next case instead of stalling for hours.
    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === "win32" && proc.pid) {
        // shell: true wraps the command in cmd.exe; tree-kill so the child
        // executor process does not survive the shell.
        spawn("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { shell: false });
      }
      else {
        proc.kill("SIGKILL");
      }
    }, PROMPT_TIMEOUT_MS);
    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    proc.on("close", (code) => {
      clearTimeout(timer);
      const endedAt = new Date();
      if (timedOut) {
        reject(new Error(`executor timed out after ${PROMPT_TIMEOUT_MS / 60000} min (possible rate limit)`));
      }
      else if (code === 0) {
        resolvePromise({ output: stdout || stderr, startedAt, endedAt });
      }
      else {
        reject(new Error(`executor exited ${code}: ${stderr.slice(0, 400)}`));
      }
    });
  });
}

/**
 * Persist per-run artifacts next to the graded key: grading.json and
 * timing.json under graded/ (aggregate_benchmark.py reads grading.json and
 * falls back to sibling timing.json), plus a copy of the executor output
 * under outputs/ per the schemas.md layout.
 */
async function writeRunArtifacts(
  caseDir: string,
  output: string,
  grade: GradeResult,
  timing: RunTiming,
  resumed = false,
): Promise<void> {
  const gradedDir = join(caseDir, "graded");
  await mkdir(gradedDir, { recursive: true });
  await writeFile(
    join(gradedDir, "grading.json"),
    JSON.stringify(buildGrading(grade, output, timing, resumed), null, 2),
    "utf-8",
  );
  await writeFile(join(gradedDir, "timing.json"), JSON.stringify(timing, null, 2), "utf-8");
  const outputsDir = join(caseDir, "outputs");
  await mkdir(outputsDir, { recursive: true });
  await writeFile(join(outputsDir, "output.txt"), output, "utf-8");
}

async function scaffold(
  skillDir: string,
  fixtureDir: string,
  skillName: string,
  evalCase: EvalCase,
  mode: EvalMode,
  iterationDir: string,
): Promise<string> {
  const caseDir = join(iterationDir, `${skillName}-${evalCase.id}`, mode);
  await mkdir(caseDir, { recursive: true });

  const skillFile = join(skillDir, "SKILL.md");
  let body: string | null = null;
  if (await exists(skillFile)) {
    body = await readFile(skillFile, "utf-8");
  }

  const prompt = mode === "with_skill" && body
    ? `TASK: ${evalCase.prompt}\n\nYou have the following skill loaded. Follow it while completing the task above.\n\n--- SKILL ${skillName} START ---\n${body}\n--- SKILL ${skillName} END ---\n\nRespond with the deliverable the task asks for. Do not summarize the skill and do not ask what the task is.`
    : evalCase.prompt;

  await writeFile(join(caseDir, "prompt.txt"), prompt, "utf-8");
  // Keep the expected output out of the case dir: the executor runs with the
  // case dir as cwd, so an expected_output.txt next to the prompt would let
  // the candidate read the grading key (contamination).
  const gradedDir = join(caseDir, "graded");
  await mkdir(gradedDir, { recursive: true });
  await writeFile(join(gradedDir, "expected_output.txt"), evalCase.expected_output ?? "", "utf-8");

  for (const rel of evalCase.files ?? []) {
    const src = resolve(fixtureDir, rel);
    if (!(await exists(src))) {
      continue;
    }
    const dst = join(caseDir, rel);
    await mkdir(resolve(dst, ".."), { recursive: true });
    await cp(src, dst, { recursive: true });
  }

  return caseDir;
}

async function runEvals(options: {
  skill?: string
  iteration: string
  executor: string
  dryRun: boolean
  limit: number
  resume: boolean
}): Promise<void> {
  const execParts = options.executor.split(" ").filter(Boolean);
  const execCmd = execParts[0] ?? "opencode";
  const execArgs = execParts.slice(1);

  let files = await findEvalsFiles();
  if (options.skill) {
    const wanted = options.skill;
    files = files.filter(f => caseStem(f) === wanted);
  }
  if (files.length === 0) {
    consola.info("no eval case files found under evals/cases/ - nothing to do");
    return;
  }

  // Validate every case file before executing anything, so a malformed
  // assertion cannot waste executor spend on a run that will grade wrong.
  const validationErrors: string[] = [];
  for (const file of files) {
    const evalsFile = JSON.parse(await readFile(file, "utf-8")) as EvalsFile;
    for (const evalCase of evalsFile.evals) {
      validationErrors.push(...validateAssertions(evalCase.assertions, `${evalsFile.skill_name}#${evalCase.id}`));
    }
  }
  if (validationErrors.length > 0) {
    for (const err of validationErrors) {
      consola.error(`invalid assertion: ${err}`);
    }
    process.exitCode = 1;
    return;
  }

  consola.info(`Workspace: ${WORKSPACE_ROOT}`);
  consola.info(`Iteration: ${options.iteration}${options.dryRun ? " (dry run)" : ""}`);
  consola.info(`Grading:   assertion v${GRADING_VERSION} (LLM judge pending)`);
  if (!options.dryRun) {
    consola.info(`Executor:  ${execParts.join(" ")}`);
  }

  let total = 0;
  let failed = 0;
  for (const file of files) {
    const raw = await readFile(file, "utf-8");
    const evalsFile: EvalsFile = JSON.parse(raw) as EvalsFile;
    const skillName = evalsFile.skill_name;
    const skillDir = join(SKILLS_ROOT, skillName);
    const fixtureDir = join(CASES_DIR, `${skillName}.files`);

    consola.log(`\n==> ${skillName} (${evalsFile.evals.length} cases)`);
    const iterationDir = join(WORKSPACE_ROOT, skillName, `iteration-${options.iteration}`);
    await mkdir(iterationDir, { recursive: true });

    const cases = options.limit > 0 ? evalsFile.evals.slice(0, options.limit) : evalsFile.evals;
    if (cases.length < evalsFile.evals.length) {
      consola.info(`  limited to first ${cases.length} of ${evalsFile.evals.length} cases`);
    }
    const entries: { id: number, with_skill: EntryStatus, without_skill: EntryStatus }[] = [];
    const benchmarkRuns: BenchmarkRunInput[] = [];

    for (const evalCase of cases) {
      const status: { with_skill: EntryStatus, without_skill: EntryStatus } = {
        with_skill: { status: "pending", passed: 0, total: 0 },
        without_skill: { status: "pending", passed: 0, total: 0 },
      };

      for (const mode of MODES) {
        const caseDir = await scaffold(skillDir, fixtureDir, skillName, evalCase, mode, iterationDir);
        if (options.dryRun) {
          consola.log(`  [dry-run] ${mode}: ${skillName}-${evalCase.id}`);
          continue;
        }
        const outputPath = join(caseDir, "output.txt");
        if (options.resume && (await exists(outputPath))) {
          // Resume: grade the existing executor output instead of re-running.
          // Pair with idempotent scaffolding so interrupted runs pick up where
          // they stopped (useful when a lane dies mid-case).
          const output = await readFile(outputPath, "utf-8");
          const grade = gradeOutput(output, evalCase.assertions);
          status[mode] = {
            status: "done (resumed)",
            passed: grade.passed,
            total: grade.total,
          };
          consola.log(`  ok  ${mode}: ${skillName}-${evalCase.id} assertions ${grade.passed}/${grade.total} (resumed)`);
          // Executor wall time is unknown for resumed runs; grading and
          // artifact structure stay valid, timing is recorded as unknown.
          await writeRunArtifacts(caseDir, output, grade, buildTiming(new Date(), new Date(), true), true);
          benchmarkRuns.push({ evalId: evalCase.id, configuration: mode, grade, timeSeconds: 0 });
          continue;
        }
        try {
          const promptText = await readFile(join(caseDir, "prompt.txt"), "utf-8");
          const { output, startedAt, endedAt } = await runPrompt(execCmd, execArgs, caseDir, promptText);
          await writeFile(outputPath, output, "utf-8");
          const grade = gradeOutput(output, evalCase.assertions);
          status[mode] = {
            status: "done",
            passed: grade.passed,
            total: grade.total,
          };
          await writeRunArtifacts(caseDir, output, grade, buildTiming(startedAt, endedAt));
          benchmarkRuns.push({
            evalId: evalCase.id,
            configuration: mode,
            grade,
            timeSeconds: (endedAt.getTime() - startedAt.getTime()) / 1000,
          });
          consola.log(`  ok  ${mode}: ${skillName}-${evalCase.id} assertions ${grade.passed}/${grade.total}`);
        }
        catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          status[mode] = { status: `failed: ${message}`, passed: 0, total: 0 };
          failed++;
          consola.error(`  ${mode} failed: ${message}`);
        }
      }

      total++;
      entries.push({ id: evalCase.id, ...status });
    }

    const aggregate = {
      with_skill: aggregatePass(entries.map(e => e.with_skill)),
      without_skill: aggregatePass(entries.map(e => e.without_skill)),
    };
    consola.log(
      `  pass rate (assertion-graded cases): with_skill ${aggregate.with_skill.passed}/${aggregate.with_skill.graded}`
      + `, without_skill ${aggregate.without_skill.passed}/${aggregate.without_skill.graded}`,
    );

    await writeFile(
      join(iterationDir, "summary.json"),
      JSON.stringify({
        skill_name: skillName,
        iteration: options.iteration,
        grading_version: GRADING_VERSION,
        grading: "assertion",
        entries,
        aggregate,
      }, null, 2),
      "utf-8",
    );

    // Vendored-tooling artifacts. benchmark.json mirrors the shape
    // aggregate_benchmark.py generates so the eval viewer can read it
    // directly; history.json records the iteration in the Improve-mode
    // progression format. Both are skipped on dry runs because no
    // measurement exists yet.
    if (!options.dryRun) {
      await writeFile(
        join(iterationDir, "benchmark.json"),
        JSON.stringify(buildBenchmark({
          skillName,
          skillPath: join(SKILLS_ROOT, skillName),
          executor: options.executor,
          runs: benchmarkRuns,
        }), null, 2),
        "utf-8",
      );

      const historyPath = join(iterationDir, "history.json");
      const history: {
        started_at: string
        skill_name: string
        current_best: string
        iterations: HistoryEntry[]
      } = (await exists(historyPath))
        ? JSON.parse(await readFile(historyPath, "utf-8"))
        : { started_at: new Date().toISOString(), skill_name: skillName, current_best: "", iterations: [] };

      // Expectation pass rate for the iteration: mean pass rate of graded
      // with_skill runs (the skill-quality signal the improve loop tracks).
      const gradedWithSkill = benchmarkRuns.filter(r => r.configuration === "with_skill" && r.grade.total > 0);
      const iterationRate = gradedWithSkill.length > 0
        ? gradedWithSkill.reduce((acc, r) => acc + r.grade.passed / r.grade.total, 0) / gradedWithSkill.length
        : 0;

      history.iterations = history.iterations.map(i => ({ ...i, is_current_best: false }));
      const entry = nextHistoryEntry(history.iterations, `v${options.iteration}`, iterationRate);
      history.iterations.push(entry);
      history.current_best = entry.version;
      await writeFile(historyPath, JSON.stringify(history, null, 2), "utf-8");

      // feedback.json scaffold for the improve loop (schemas.md): populated by
      // a future LLM-judge grading pass; never overwrite an existing one.
      const feedbackPath = join(iterationDir, "feedback.json");
      if (!(await exists(feedbackPath))) {
        await writeFile(feedbackPath, JSON.stringify({ suggestions: [], overall: "" }, null, 2), "utf-8");
      }
    }
  }

  consola.log("\n==> Done");
  consola.info(`Evals: ${total}, failures: ${failed}`);
  if (options.dryRun) {
    consola.log("Dry run - re-run without --dry-run to execute prompts via the executor.");
  }
  if (failed > 0) {
    process.exitCode = 1;
  }
}

const main = defineCommand({
  meta: {
    name: "run-evals",
    description: "Scaffold and run agent skill evals (agentskills.io pattern)",
  },
  args: {
    "skill": { type: "string" as const, description: "Only eval this skill directory" },
    "iteration": { type: "string" as const, description: "Iteration number (default: 1)" },
    "executor": { type: "string" as const, description: "Shell command to run each prompt" },
    "dry-run": { type: "boolean" as const, description: "Scaffold without executing prompts" },
    "limit": {
      type: "string" as const,
      description: "Limit number of eval cases per skill (0 = all; useful for small paid batches)",
      default: "0",
    },
    "resume": {
      type: "boolean" as const,
      description: "Grade existing output.txt instead of re-executing (resumes interrupted runs)",
    },
    "judge": {
      type: "boolean" as const,
      description: "Reserved for LLM-judge grading; not implemented yet",
    },
  },
  run: async ({ args }) => {
    if (args.judge) {
      // LLM-judge grading is planned (DECISIONS.md) but not wired yet. Fail
      // loudly instead of silently falling back to assertion grading, which
      // would produce results mistaken for judge-graded ones.
      consola.error("--judge is not implemented yet; deterministic assertion grading is used by default (see DECISIONS.md)");
      process.exitCode = 1;
      return;
    }
    await runEvals({
      skill: args.skill as string | undefined,
      iteration: (args.iteration as string | undefined) ?? "1",
      executor: (args.executor as string | undefined) ?? DEFAULT_EXECUTOR,
      dryRun: Boolean(args["dry-run"]),
      limit: Number(args.limit ?? 0) || 0,
      resume: Boolean(args.resume),
    });
  },
});

if (import.meta.main) {
  runMain(main);
}
