import { cp, mkdir, readdir, rm, stat, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import process from "node:process";
import { consola } from "consola";
import { join } from "pathe";
import { backupGlobal } from "../lib/backup";
import { buildConfig, buildTuiConfig, writeConfig, writeTuiConfig } from "../lib/config";
import { getGlobalAgentsRoot, getGlobalRoot, repoSubdir } from "../lib/paths";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch {
    return false;
  }
}

export interface SymlinkOptions {
  dryRun?: boolean;
  targetDir?: string;
  repoRoot?: string;
}

async function canCreateSymlinks(): Promise<boolean> {
  if (process.platform !== "win32") {
    return true;
  }
  const testDir = join(tmpdir(), "opencode-symlink-test");
  try {
    await symlink(tmpdir(), testDir, "junction");
    await rm(testDir, { force: true });
    return true;
  }
  catch {
    return false;
  }
}

async function ensureDir(path: string, dry: boolean): Promise<void> {
  if (await exists(path)) {
    return;
  }
  if (dry) {
    consola.log(`  [dry-run] mkdir ${path}`);
  }
  else {
    await mkdir(path, { recursive: true });
  }
}

async function safeLink(path: string, target: string, label: string, dry: boolean): Promise<void> {
  if (dry) {
    consola.log(`  [dry-run] symlink ${label} to ${target}`);
    return;
  }
  if (await exists(path)) {
    await rm(path, { recursive: true, force: true });
  }
  try {
    const isDir = (await stat(target)).isDirectory();
    await symlink(target, path, isDir ? "dir" : "file");
    consola.log(`  symlink ${label}`);
  }
  catch {
    consola.log(`  symlink fail for ${label} - copying instead`);
    if ((await stat(target)).isDirectory()) {
      await cp(target, path, { recursive: true });
    }
    else {
      await cp(target, path);
    }
    consola.log(`  copy ${label}`);
  }
}

async function linkItems(
  srcDir: string,
  dstDir: string,
  name: string,
  useSymlinks: boolean,
  dry: boolean,
): Promise<void> {
  consola.log(`\n==> Linking ${name}`);
  await ensureDir(dstDir, dry);
  if (!(await exists(srcDir))) {
    return;
  }

  const items = await readdir(srcDir);
  const tasks = items.map(async (item) => {
    const itemPath = join(srcDir, item);
    const linkPath = join(dstDir, item);
    if (useSymlinks) {
      await safeLink(linkPath, itemPath, `${name.slice(0, -1)}/${item}`, dry);
    }
    else {
      if (dry) {
        consola.log(`  [dry-run] copy ${name.slice(0, -1)} ${item}`);
      }
      else {
        if ((await stat(itemPath)).isDirectory()) {
          if (await exists(linkPath)) {
            await rm(linkPath, { recursive: true, force: true });
          }
          await cp(itemPath, linkPath, { recursive: true });
        }
        else {
          await cp(itemPath, linkPath);
        }
        consola.log(`  copy ${name.slice(0, -1)} ${item}`);
      }
    }
  });
  await Promise.all(tasks);
}

export async function symlinkCommand(opts: SymlinkOptions): Promise<void> {
  const repoRoot = opts.repoRoot ?? repoSubdir(".");
  const dstRoot = getGlobalRoot(opts.targetDir);
  const agentsRoot = getGlobalAgentsRoot(opts.targetDir);
  const repoAgents = join(repoRoot, "agents");
  const repoSkills = join(repoRoot, "skills");
  const repoTools = join(repoRoot, "tools");
  const repoCommands = join(repoRoot, "commands");
  const repoGlobalAgentsMd = join(repoRoot, "instructions", "AGENTS.md");

  const useSymlinks = await canCreateSymlinks();
  const symLabel = useSymlinks ? "available" : "NOT available - falling back to copy";

  consola.info(`Repo:       ${repoRoot}`);
  consola.info(`Global:     ${dstRoot}`);
  consola.info(`Agents:     ${agentsRoot}`);
  consola.info(`Symlinks:   ${symLabel}`);
  if (opts.dryRun) {
    consola.info("Mode:       DRY RUN");
  }

  if (!(await exists(repoAgents))) {
    throw new Error(`Missing source: ${repoAgents}`);
  }
  if (!(await exists(repoSkills))) {
    throw new Error(`Missing source: ${repoSkills}`);
  }
  if (!(await exists(repoGlobalAgentsMd))) {
    throw new Error(`Missing source: ${repoGlobalAgentsMd}`);
  }

  // Backup (sequential)
  const backupPath = await backupGlobal({ dryRun: opts.dryRun ?? false, targetDir: opts.targetDir });

  // Link all sections in parallel
  await Promise.all([
    linkItems(repoAgents, join(dstRoot, "agents"), "agents", useSymlinks, opts.dryRun ?? false),
    linkItems(repoSkills, join(dstRoot, "skills"), "skills", useSymlinks, opts.dryRun ?? false),
    linkItems(repoSkills, join(agentsRoot, "skills"), "agent-skills (~/.agents/skills)", useSymlinks, opts.dryRun ?? false),
    linkItems(repoTools, join(dstRoot, "tools"), "tools", useSymlinks, opts.dryRun ?? false),
    linkItems(repoCommands, join(dstRoot, "commands"), "commands", useSymlinks, opts.dryRun ?? false),
  ]);

  // Link AGENTS.md
  consola.log("\n==> Linking AGENTS.md");
  const agentsMdDst = join(dstRoot, "AGENTS.md");
  if (useSymlinks) {
    await safeLink(agentsMdDst, repoGlobalAgentsMd, "AGENTS.md", opts.dryRun ?? false);
  }
  else {
    if (opts.dryRun) {
      consola.log("  [dry-run] copy AGENTS.md");
    }
    else {
      await cp(repoGlobalAgentsMd, agentsMdDst);
      consola.log("  copy AGENTS.md");
    }
  }

  // Write opencode.jsonc & tui.jsonc
  consola.log("\n==> Writing opencode.jsonc & tui.jsonc (merge from previous config)");
  const cfg = await buildConfig({ dryRun: opts.dryRun, backupPath, targetDir: opts.targetDir, repoRoot });
  await writeConfig(cfg, { dryRun: opts.dryRun, backupPath, targetDir: opts.targetDir, repoRoot });

  const tuiCfg = await buildTuiConfig({ dryRun: opts.dryRun, backupPath, targetDir: opts.targetDir, repoRoot });
  await writeTuiConfig(tuiCfg, { dryRun: opts.dryRun, backupPath, targetDir: opts.targetDir, repoRoot });

  // Summary
  consola.log("\n==> Done");
  if (backupPath) {
    consola.info(`Backup:  ${backupPath}`);
  }
  if (useSymlinks) {
    consola.log("Symlinks created - edit files in repo and changes are live.");
  }
  else {
    consola.log("Files copied - run this script again after pulling changes.");
  }
  consola.log("Restart OpenCode (or open a new session) to load the new global setup.");
}
