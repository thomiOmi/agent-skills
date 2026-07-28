import { existsSync, mkdirSync, symlinkSync, cpSync, readdirSync, statSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getGlobalRoot, repoSubdir } from "../lib/paths";
import { backupGlobal } from "../lib/backup";
import { buildConfig, writeConfig } from "../lib/config";

export interface SymlinkOptions {
  dryRun?: boolean
}

function canCreateSymlinks(): boolean {
  if (process.platform !== "win32") return true;
  const testDir = join(tmpdir(), "opencode-symlink-test");
  try {
    symlinkSync(tmpdir(), testDir, "junction");
    rmSync(testDir);
    return true;
  }
  catch {
    return false;
  }
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

function safeLink(path: string, target: string, label: string, dryRun: boolean): void {
  if (dryRun) {
    console.log(`  [dry-run] symlink ${label} → ${target}`);
    return;
  }
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
  try {
    const isDir = statSync(target).isDirectory();
    symlinkSync(target, path, isDir ? "dir" : "file");
    console.log(`  symlink ${label}`);
  }
  catch {
    console.log(`  symlink failed for ${label} — copying instead`);
    if (statSync(target).isDirectory()) {
      cpSync(target, path, { recursive: true });
    }
    else {
      cpSync(target, path);
    }
    console.log(`  copy ${label}`);
  }
}

export function symlinkCommand(opts: SymlinkOptions): void {
  const repoRoot = repoSubdir(".");
  const dstRoot = getGlobalRoot();
  const repoAgents = repoSubdir("agents");
  const repoSkills = repoSubdir("skills");
  const repoTools = repoSubdir("tools");
  const repoCommands = repoSubdir("commands");
  const repoAgentsMd = join(repoRoot, "AGENTS.md");

  const useSymlinks = canCreateSymlinks();
  const symLabel = useSymlinks ? "available" : "NOT available — falling back to copy";

  console.log(`Repo:       ${repoRoot}`);
  console.log(`Global:     ${dstRoot}`);
  console.log(`Symlinks:   ${symLabel}`);
  if (opts.dryRun) console.log("Mode:       DRY RUN");

  if (!existsSync(repoAgents)) throw new Error(`Missing source: ${repoAgents}`);
  if (!existsSync(repoSkills)) throw new Error(`Missing source: ${repoSkills}`);
  if (!existsSync(repoAgentsMd)) throw new Error(`Missing source: ${repoAgentsMd}`);

  // Backup
  const backupPath = backupGlobal({ dryRun: opts.dryRun ?? false });

  // Link subdirs
  const dirs: { name: string, src: string, dst: string }[] = [
    { name: "agents", src: repoAgents, dst: join(dstRoot, "agents") },
    { name: "skills", src: repoSkills, dst: join(dstRoot, "skills") },
    { name: "tools", src: repoTools, dst: join(dstRoot, "tools") },
    { name: "commands", src: repoCommands, dst: join(dstRoot, "commands") },
  ];

  for (const d of dirs) {
    console.log(`\n==> Linking ${d.name}`);
    ensureDir(d.dst, opts.dryRun ?? false);
    if (existsSync(d.src)) {
      const items = readdirSync(d.src);
      for (const name of items) {
        const itemPath = join(d.src, name);
        const linkPath = join(d.dst, name);
        if (useSymlinks) {
          safeLink(linkPath, itemPath, `${d.name.slice(0, -1)}/${name}`, opts.dryRun ?? false);
        }
        else {
          if (opts.dryRun) {
            console.log(`  [dry-run] copy ${d.name.slice(0, -1)} ${name}`);
          }
          else {
            if (statSync(itemPath).isDirectory()) {
              if (existsSync(linkPath)) rmSync(linkPath, { recursive: true, force: true });
              cpSync(itemPath, linkPath, { recursive: true });
            }
            else {
              cpSync(itemPath, linkPath);
            }
            console.log(`  copy ${d.name.slice(0, -1)} ${name}`);
          }
        }
      }
    }
  }

  // Link AGENTS.md
  console.log("\n==> Linking AGENTS.md");
  const agentsMdDst = join(dstRoot, "AGENTS.md");
  if (useSymlinks) {
    safeLink(agentsMdDst, repoAgentsMd, "AGENTS.md", opts.dryRun ?? false);
  }
  else {
    if (opts.dryRun) {
      console.log("  [dry-run] copy AGENTS.md");
    }
    else {
      cpSync(repoAgentsMd, agentsMdDst);
      console.log("  copy AGENTS.md");
    }
  }

  // Write opencode.jsonc
  console.log("\n==> Writing opencode.jsonc (merge MCP/LSP from previous config)");
  const cfg = buildConfig({ dryRun: opts.dryRun, backupPath });
  writeConfig(cfg, { dryRun: opts.dryRun, backupPath });

  // Summary
  console.log("\n==> Done");
  if (backupPath) console.log(`Backup:  ${backupPath}`);
  if (useSymlinks) {
    console.log("Symlinks created — edit files in repo and changes are live.");
  }
  else {
    console.log("Files copied — run this script again after pulling changes.");
  }
  console.log("Restart OpenCode (or open a new session) to load the new global setup.");
}
