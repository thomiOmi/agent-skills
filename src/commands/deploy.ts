import { existsSync, mkdirSync, cpSync, readdirSync, rmSync } from "fs";
import { join } from "path";
import { getGlobalRoot, repoSubdir } from "../lib/paths";
import { backupGlobal } from "../lib/backup";
import { buildConfig, writeConfig } from "../lib/config";

export interface DeployOptions {
  dryRun?: boolean
  skipBackup?: boolean
  backupPath?: string
}

function ensureDir(path: string, dryRun: boolean): void {
  if (existsSync(path)) return;
  if (dryRun) {
    console.log(`  [dry-run] mkdir ${path}`);
  }
  else {
    mkdirSync(path, { recursive: true });
  }
}

export function deployCommand(opts: DeployOptions): void {
  const repoRoot = repoSubdir(".");
  const dstRoot = getGlobalRoot();
  const repoAgents = repoSubdir("agents");
  const repoSkills = repoSubdir("skills");
  const repoTools = repoSubdir("tools");
  const repoCommands = repoSubdir("commands");
  const repoAgentsMd = join(repoRoot, "AGENTS.md");

  const sources = [repoAgents, repoSkills, repoTools, repoCommands, repoAgentsMd];
  for (const p of sources) {
    if (!existsSync(p)) throw new Error(`Missing source: ${p}`);
  }

  console.log(`Repo:   ${repoRoot}`);
  console.log(`Global: ${dstRoot}`);
  if (opts.dryRun) console.log("Mode:   DRY RUN");

  ensureDir(dstRoot, opts.dryRun ?? false);

  // Backup
  const backupPath = backupGlobal({
    dryRun: opts.dryRun ?? false,
    skip: opts.skipBackup,
    backupPath: opts.backupPath,
  });

  // Overwrite agents
  console.log("\n==> Overwriting agents");
  const agentsDst = join(dstRoot, "agents");
  if (!opts.dryRun) {
    if (existsSync(agentsDst)) rmSync(agentsDst, { recursive: true, force: true });
    ensureDir(agentsDst, false);
    cpSync(repoAgents, agentsDst, { recursive: true });
  }
  for (const name of readdirSync(repoAgents)) {
    console.log(`  agent ${name}`);
  }

  // Overwrite skills
  console.log("\n==> Overwriting skills");
  const skillsDst = join(dstRoot, "skills");
  if (!opts.dryRun) {
    if (existsSync(skillsDst)) rmSync(skillsDst, { recursive: true, force: true });
    ensureDir(skillsDst, false);
    cpSync(repoSkills, skillsDst, { recursive: true });
  }
  for (const name of readdirSync(repoSkills)) {
    console.log(`  ${opts.dryRun ? "[dry-run] " : ""}skill ${name}`);
  }

  // Overwrite tools
  console.log("\n==> Overwriting tools");
  const toolsDst = join(dstRoot, "tools");
  if (!opts.dryRun) {
    if (existsSync(toolsDst)) rmSync(toolsDst, { recursive: true, force: true });
    ensureDir(toolsDst, false);
    cpSync(repoTools, toolsDst, { recursive: true });
  }
  for (const name of readdirSync(repoTools).filter(f => f.endsWith(".ts"))) {
    console.log(`  tool ${name}`);
  }

  // Overwrite commands
  console.log("\n==> Overwriting commands");
  const commandsDst = join(dstRoot, "commands");
  if (!opts.dryRun) {
    if (existsSync(commandsDst)) rmSync(commandsDst, { recursive: true, force: true });
    ensureDir(commandsDst, false);
    cpSync(repoCommands, commandsDst, { recursive: true });
  }
  for (const name of readdirSync(repoCommands).filter(f => f.endsWith(".md"))) {
    console.log(`  command /${name.replace(/\.md$/, "")}`);
  }

  // Overwrite AGENTS.md
  console.log("\n==> Overwriting AGENTS.md");
  const agentsMdDst = join(dstRoot, "AGENTS.md");
  if (opts.dryRun) {
    console.log("  [dry-run] AGENTS.md");
  }
  else {
    cpSync(repoAgentsMd, agentsMdDst);
    console.log("  ok  AGENTS.md");
  }

  // Write opencode.jsonc
  console.log("\n==> Writing opencode.jsonc (merge MCP/LSP from previous config)");
  const cfg = buildConfig({ dryRun: opts.dryRun, backupPath });
  writeConfig(cfg, { dryRun: opts.dryRun, backupPath });

  // Summary
  console.log("\n==> Done");
  if (backupPath) console.log(`Backup:  ${backupPath}`);
  console.log("Deployed agents / skills / tools / commands / AGENTS.md / opencode.jsonc");
  console.log("Restart OpenCode (or open a new session) to load the new global setup.");
}
