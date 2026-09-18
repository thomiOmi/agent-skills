/**
 * Eval runner for agent skills (agentskills.io eval pattern).
 *
 * Reads eval case definitions from evals/cases/<skill>.json, scaffolds
 * evals/workspace/<skill>/iteration-N/<skill>-<id>/with_skill and
 * without_skill subdirs with prompt.txt, output.txt (executor output), and a
 * graded/ subdir holding expected_output.txt (kept out of the executor cwd to
 * avoid leaking the grading key), plus summary.json. Executor default:
 * opencode run --agent build --auto (build agent so candidates execute the
 * task instead of answering in plan mode).
 */
import { defineCommand, runMain } from "citty";
import { mkdir, readdir, readFile, writeFile, cp, stat } from "fs/promises";
import { join, resolve } from "pathe";
import { spawn } from "child_process";
import { consola } from "consola";

type EvalMode = "with_skill" | "without_skill";
const MODES: EvalMode[] = ["with_skill", "without_skill"];
const WORKSPACE_ROOT = resolve(process.cwd(), "evals", "workspace");
const CASES_DIR = resolve(process.cwd(), "evals", "cases");
const SKILLS_ROOT = resolve(process.cwd(), "skills");

interface EvalCase {
  id: number
  prompt: string
  expected_output?: string
  files?: string[]
  assertions?: string[]
}

interface EvalsFile {
  skill_name: string
  evals: EvalCase[]
}

interface GradeResult {
  passed: number
  total: number
  details: { assertion: string, passed: boolean }[]
}

interface EntryStatus {
  status: string
  passed: number
  total: number
}

function aggregatePass(items: EntryStatus[]): { passed: number, graded: number } {
  const graded = items.filter(i => i.total > 0);
  return {
    passed: graded.filter(i => i.passed === i.total).length,
    graded: graded.length,
  };
}

export function gradeOutput(output: string, assertions: string[] | undefined): GradeResult {
  const list = assertions ?? [];
  if (list.length === 0) {
    return { passed: 0, total: 0, details: [] };
  }
  const details = list.map(assertion => ({
    assertion,
    passed: output.toLowerCase().includes(assertion.toLowerCase()),
  }));
  return {
    passed: details.filter(d => d.passed).length,
    total: details.length,
    details,
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

function runPrompt(command: string, args: string[], cwd: string, promptText: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
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
      if (timedOut) {
        reject(new Error(`executor timed out after ${PROMPT_TIMEOUT_MS / 60000} min (possible rate limit)`));
      }
      else if (code === 0) {
        resolvePromise(stdout || stderr);
      }
      else {
        reject(new Error(`executor exited ${code}: ${stderr.slice(0, 400)}`));
      }
    });
  });
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

  consola.info(`Workspace: ${WORKSPACE_ROOT}`);
  consola.info(`Iteration: ${options.iteration}${options.dryRun ? " (dry run)" : ""}`);
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
          continue;
        }
        try {
          const promptText = await readFile(join(caseDir, "prompt.txt"), "utf-8");
          const output = await runPrompt(execCmd, execArgs, caseDir, promptText);
          await writeFile(outputPath, output, "utf-8");
          const grade = gradeOutput(output, evalCase.assertions);
          status[mode] = {
            status: "done",
            passed: grade.passed,
            total: grade.total,
          };
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
      JSON.stringify({ skill_name: skillName, iteration: options.iteration, entries, aggregate }, null, 2),
      "utf-8",
    );
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
      consola.error("--judge is not implemented yet; deterministic assertion grading is used by default (see DECISIONS.md)");
      process.exitCode = 1;
      return;
    }
    await runEvals({
      skill: args.skill as string | undefined,
      iteration: (args.iteration as string | undefined) ?? "1",
      executor: (args.executor as string | undefined) ?? "opencode run --agent build --auto",
      dryRun: Boolean(args["dry-run"]),
      limit: Number(args.limit ?? 0) || 0,
      resume: Boolean(args.resume),
    });
  },
});

if (import.meta.main) {
  runMain(main);
}
