/**
 * Eval runner for agent skills (agentskills.io eval pattern).
 *
 * Scaffolds evals/workspace/<skill>/iteration-N/<skill>-<id>/with_skill and
 * without_skill subdirs with prompt.txt, expected_output.txt, output.txt
 * (executor output), and summary.json. Executor default: opencode run.
 */
import { defineCommand, runMain } from "citty";
import { mkdir, readdir, readFile, writeFile, cp, stat } from "fs/promises";
import { join, resolve } from "pathe";
import { spawn } from "child_process";
import { consola } from "consola";

type EvalMode = "with_skill" | "without_skill";
const MODES: EvalMode[] = ["with_skill", "without_skill"];
const WORKSPACE_ROOT = resolve(process.cwd(), "evals", "workspace");

interface EvalCase {
  id: number
  prompt: string
  expected_output?: string
  files?: string[]
}

interface EvalsFile {
  skill_name: string
  evals: EvalCase[]
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

async function findEvalsFiles(): Promise<string[]> {
  const root = resolve(process.cwd(), "skills");
  if (!(await exists(root))) {
    return [];
  }
  const dirs = await readdir(root, { withFileTypes: true });
  const out: string[] = [];
  for (const d of dirs) {
    if (!d.isDirectory()) {
      continue;
    }
    const file = join(root, d.name, "evals", "evals.json");
    if (await exists(file)) {
      out.push(file);
    }
  }
  return out;
}

function runPrompt(command: string, args: string[], cwd: string, promptText: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn(command, [...args, promptText], {
      cwd,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) {
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
    ? `[Skill: ${skillName}]\n\nSkill instructions:\n${body}\n---\n${evalCase.prompt}`
    : evalCase.prompt;

  await writeFile(join(caseDir, "prompt.txt"), prompt, "utf-8");
  await writeFile(join(caseDir, "expected_output.txt"), evalCase.expected_output ?? "", "utf-8");

  for (const rel of evalCase.files ?? []) {
    const src = resolve(skillDir, "evals", rel);
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
}): Promise<void> {
  const execParts = options.executor.split(" ").filter(Boolean);
  const execCmd = execParts[0] ?? "opencode";
  const execArgs = execParts.slice(1);

  let files = await findEvalsFiles();
  if (options.skill) {
    const wanted = options.skill;
    files = files.filter(f => f.replace(/\\/g, "/").includes(`/${wanted}/evals/`));
  }
  if (files.length === 0) {
    consola.info("no evals/evals.json found under skills/ - nothing to do");
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
    const skillDir = resolve(file, "..", "..");
    const raw = await readFile(file, "utf-8");
    const evalsFile: EvalsFile = JSON.parse(raw) as EvalsFile;
    const skillName = evalsFile.skill_name;

    consola.log(`\n==> ${skillName} (${evalsFile.evals.length} cases)`);
    const iterationDir = join(WORKSPACE_ROOT, skillName, `iteration-${options.iteration}`);
    await mkdir(iterationDir, { recursive: true });

    const entries: { id: number, with_skill: string, without_skill: string }[] = [];

    for (const evalCase of evalsFile.evals) {
      const status: { with_skill: string, without_skill: string } = {
        with_skill: "pending",
        without_skill: "pending",
      };

      for (const mode of MODES) {
        const caseDir = await scaffold(skillDir, skillName, evalCase, mode, iterationDir);
        if (options.dryRun) {
          consola.log(`  [dry-run] ${mode}: ${skillName}-${evalCase.id}`);
          continue;
        }
        try {
          const promptText = await readFile(join(caseDir, "prompt.txt"), "utf-8");
          const output = await runPrompt(execCmd, execArgs, caseDir, promptText);
          await writeFile(join(caseDir, "output.txt"), output, "utf-8");
          status[mode] = "done";
          consola.log(`  ok  ${mode}: ${skillName}-${evalCase.id}`);
        }
        catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          status[mode] = `failed: ${message}`;
          failed++;
          consola.error(`  ${mode} failed: ${message}`);
        }
      }

      total++;
      entries.push({ id: evalCase.id, ...status });
    }

    await writeFile(
      join(iterationDir, "summary.json"),
      JSON.stringify({ skill_name: skillName, iteration: options.iteration, entries }, null, 2),
      "utf-8",
    );
  }

  consola.log("\n==> Done");
  consola.info(`Evals: ${total}, failures: ${failed}`);
  if (options.dryRun) {
    consola.log("Dry run - re-run without --dry-run to execute prompts via the executor.");
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
  },
  run: async ({ args }) => {
    await runEvals({
      skill: args.skill as string | undefined,
      iteration: (args.iteration as string | undefined) ?? "1",
      executor: (args.executor as string | undefined) ?? "opencode run",
      dryRun: Boolean(args["dry-run"]),
    });
  },
});

runMain(main);
