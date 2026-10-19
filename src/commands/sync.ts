import { cp, mkdir, stat } from "node:fs/promises";
import { consola } from "consola";
import { join } from "pathe";
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

export interface SyncOptions {
  dryRun?: boolean;
  targetDir?: string;
  repoRoot?: string;
}

export async function syncCommand(opts: SyncOptions): Promise<void> {
  const repoRoot = opts.repoRoot ?? repoSubdir(".");
  const globalRoot = getGlobalRoot(opts.targetDir);
  const agentsRoot = getGlobalAgentsRoot(opts.targetDir);
  const globalAgentsFile = join(repoRoot, "instructions", "AGENTS.md");

  if (!(await exists(globalRoot))) {
    if (opts.dryRun) {
      consola.log(`  [dry-run] mkdir ${globalRoot}`);
    }
    else {
      await mkdir(globalRoot, { recursive: true });
    }
  }

  const sections: { name: string; src: string; dst: string; type: "file" | "directory" }[] = [
    { name: "AGENTS.md", src: globalAgentsFile, dst: join(globalRoot, "AGENTS.md"), type: "file" },
    { name: "agents", src: join(repoRoot, "agents"), dst: join(globalRoot, "agents"), type: "directory" },
    { name: "skills", src: join(repoRoot, "skills"), dst: join(globalRoot, "skills"), type: "directory" },
    { name: "agent-skills (~/.agents/skills)", src: join(repoRoot, "skills"), dst: join(agentsRoot, "skills"), type: "directory" },
    { name: "commands", src: join(repoRoot, "commands"), dst: join(globalRoot, "commands"), type: "directory" },
  ];

  consola.info(`Repo:   ${repoRoot}`);
  consola.info(`Global: ${globalRoot}`);
  consola.info(`Agents: ${agentsRoot}`);
  consola.log("");

  for (const section of sections) {
    if (section.type === "directory") {
      await mkdir(section.dst, { recursive: true });
    }
    else {
      await mkdir(join(section.dst, ".."), { recursive: true });
    }

    if (!(await exists(section.src))) {
      consola.warn(`source not found: ${section.src}`);
      continue;
    }

    if (section.type === "file") {
      if (opts.dryRun) {
        consola.log(`  [dry-run] copy ${section.name}`);
      }
      else {
        await cp(section.src, section.dst);
        consola.log(`  ok  ${section.name}`);
      }
      consola.log("");
      continue;
    }

    if (opts.dryRun) {
      consola.log(`  [dry-run] sync ${section.name}`);
    }
    else {
      await cp(section.src, section.dst, { recursive: true, force: true });
      consola.log(`  ok  ${section.name}`);
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
