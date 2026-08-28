import { mkdir, readdir, cp, stat } from "fs/promises";
import { join } from "pathe";
import { consola } from "consola";
import { getGlobalRoot, getGlobalAgentsRoot, repoSubdir } from "../lib/paths";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch {
    return false;
  }
}

export interface SyncOptions {
  dryRun?: boolean
  targetDir?: string
  repoRoot?: string
}

export async function syncCommand(opts: SyncOptions): Promise<void> {
  const repoRoot = opts.repoRoot ?? repoSubdir(".");
  const globalRoot = getGlobalRoot(opts.targetDir);
  const agentsRoot = getGlobalAgentsRoot(opts.targetDir);

  if (!(await exists(globalRoot))) {
    if (opts.dryRun) {
      consola.log(`  [dry-run] mkdir ${globalRoot}`);
    }
    else {
      await mkdir(globalRoot, { recursive: true });
    }
  }

  const sections: { name: string, src: string, dst: string, type: "file" | "dir" }[] = [
    { name: "agents", src: join(repoRoot, "agents"), dst: join(globalRoot, "agents"), type: "file" as const },
    { name: "skills", src: join(repoRoot, "skills"), dst: join(globalRoot, "skills"), type: "dir" as const },
    { name: "agent-skills (~/.agents/skills)", src: join(repoRoot, "skills"), dst: join(agentsRoot, "skills"), type: "dir" as const },
    { name: "tools", src: join(repoRoot, "tools"), dst: join(globalRoot, "tools"), type: "file" as const },
    { name: "commands", src: join(repoRoot, "commands"), dst: join(globalRoot, "commands"), type: "file" as const },
  ];

  consola.info(`Repo:   ${repoRoot}`);
  consola.info(`Global: ${globalRoot}`);
  consola.info(`Agents: ${agentsRoot}`);
  consola.log("");

  for (const section of sections) {
    await mkdir(section.dst, { recursive: true });

    if (!(await exists(section.src))) {
      consola.warn(`source not found: ${section.src}`);
      continue;
    }

    const entries = await readdir(section.src, { withFileTypes: true });

    if (section.type === "dir") {
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
      consola.log(`Syncing ${dirs.length} ${section.name}...`);
      const tasks = dirs.map(async (name) => {
        const src = join(section.src, name);
        const dst = join(section.dst, name);
        if (opts.dryRun) {
          consola.log(`  [dry-run] ${section.name.slice(0, -1)} ${name}`);
        }
        else {
          await cp(src, dst, { recursive: true, force: true });
          consola.log(`  ok  ${section.name.slice(0, -1)} ${name}`);
        }
      });
      await Promise.all(tasks);
    }
    else {
      const files = entries.filter(e => e.isFile()).map(e => e.name);
      consola.log(`Syncing ${files.length} ${section.name}...`);
      const tasks = files.map(async (name) => {
        const src = join(section.src, name);
        const dst = join(section.dst, name);
        if (opts.dryRun) {
          consola.log(`  [dry-run] ${section.name.slice(0, -1)} ${name}`);
        }
        else {
          await cp(src, dst);
          consola.log(`  ok  ${section.name.slice(0, -1)} ${name}`);
        }
      });
      await Promise.all(tasks);
    }
    consola.log("");
  }

  if (opts.dryRun) {
    consola.log("Dry run complete. Re-run without --dry-run to apply.");
  }
  else {
    consola.log("Sync complete. Restart OpenCode (or start a new session) to pick up changes.");
    consola.log("Preserved global-only items outside this repo (e.g. custom agents, third-party skills, tools, commands).");
  }
}
