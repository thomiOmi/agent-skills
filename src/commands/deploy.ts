import { mkdir, cp, readdir, rm, stat } from "fs/promises";
import { join } from "pathe";
import { consola } from "consola";
import { getGlobalRoot, repoSubdir } from "../lib/paths";
import { backupGlobal } from "../lib/backup";
import { buildConfig, writeConfig } from "../lib/config";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch {
    return false;
  }
}

export interface DeployOptions {
  dryRun?: boolean
  skipBackup?: boolean
  backupPath?: string
  targetDir?: string
}

async function ensureDir(path: string, dry: boolean): Promise<void> {
  if (await exists(path)) return;
  if (dry) {
    consola.log(`  [dry-run] mkdir ${path}`);
  }
  else {
    await mkdir(path, { recursive: true });
  }
}

async function overwriteDir(
  src: string, dst: string, label: string,
  labelFn: (n: string) => string, dry: boolean,
): Promise<void> {
  consola.log(`\n==> Overwriting ${label}`);
  if (!dry) {
    if (await exists(dst)) {
      await rm(dst, { recursive: true, force: true });
    }
    await ensureDir(dst, false);
    await cp(src, dst, { recursive: true });
  }
  for (const name of await readdir(src)) {
    consola.log(`  ${dry ? "[dry-run] " : ""}${labelFn(name)}`);
  }
}

export async function deployCommand(opts: DeployOptions): Promise<void> {
  const repoRoot = repoSubdir(".");
  const dstRoot = getGlobalRoot(opts.targetDir);
  const repoAgents = repoSubdir("agents");
  const repoSkills = repoSubdir("skills");
  const repoCommands = repoSubdir("commands");
  const repoTools = repoSubdir("tools");
  const repoPlugin = repoSubdir("plugin");
  const repoAgentsMd = join(repoRoot, "AGENTS.md");

  const sources = [repoAgents, repoSkills, repoTools, repoCommands, repoPlugin, repoAgentsMd];
  for (const p of sources) {
    if (!(await exists(p))) throw new Error(`Missing source: ${p}`);
  }

  consola.info(`Repo:   ${repoRoot}`);
  consola.info(`Global: ${dstRoot}`);
  if (opts.dryRun) consola.info("Mode:   DRY RUN");

  await ensureDir(dstRoot, opts.dryRun ?? false);

  // Backup (sequential - must finish before overwrite)
  const backupPath = await backupGlobal({
    dryRun: opts.dryRun ?? false,
    skip: opts.skipBackup,
    backupPath: opts.backupPath,
    targetDir: opts.targetDir,
  });

  // Overwrite all sections in parallel
  await Promise.all([
    overwriteDir(repoAgents, join(dstRoot, "agents"), "agents", name => `agent ${name}`, opts.dryRun ?? false),
    overwriteDir(repoSkills, join(dstRoot, "skills"), "skills", name => `skill ${name}`, opts.dryRun ?? false),
    overwriteDir(repoTools, join(dstRoot, "tools"), "tools", name => `tool ${name}`, opts.dryRun ?? false),
    overwriteDir(repoPlugin, join(dstRoot, "plugins"), "plugins", name => `plugin ${name}`, opts.dryRun ?? false),
    overwriteDir(repoCommands, join(dstRoot, "commands"), "commands", name => `command /${name.replace(/\.md$/, "")}`, opts.dryRun ?? false),
    (async () => {
      consola.log("\n==> Overwriting AGENTS.md");
      const agentsMdDst = join(dstRoot, "AGENTS.md");
      if (opts.dryRun) {
        consola.log("  [dry-run] AGENTS.md");
      }
      else {
        await cp(repoAgentsMd, agentsMdDst);
        consola.log("  ok  AGENTS.md");
      }
    })(),
  ]);

  // Write opencode.jsonc
  consola.log("\n==> Writing opencode.jsonc (merge MCP/LSP from previous config)");
  const cfg = await buildConfig({ dryRun: opts.dryRun, backupPath, targetDir: opts.targetDir });
  await writeConfig(cfg, { dryRun: opts.dryRun, backupPath, targetDir: opts.targetDir });

  // Summary
  consola.log("\n==> Done");
  if (backupPath) consola.info(`Backup:  ${backupPath}`);
  consola.log("Deployed agents / skills / tools / plugins / commands / AGENTS.md / opencode.jsonc");
  consola.log("Restart OpenCode (or open a new session) to load the new global setup.");
}
