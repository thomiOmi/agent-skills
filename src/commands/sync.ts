import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { getGlobalRoot, repoSubdir } from "../lib/paths";

export interface SyncOptions {
  dryRun?: boolean
}

export function syncCommand(opts: SyncOptions): void {
  const globalRoot = getGlobalRoot();

  if (!existsSync(globalRoot)) {
    throw new Error(`Global OpenCode directory not found: ${globalRoot}`);
  }

  const sections: { name: string, src: string, dst: string, type: "file" | "dir" }[] = [
    { name: "agents", src: repoSubdir("agents"), dst: join(globalRoot, "agents"), type: "file" as const },
    { name: "skills", src: repoSubdir("skills"), dst: join(globalRoot, "skills"), type: "dir" as const },
    { name: "tools", src: repoSubdir("tools"), dst: join(globalRoot, "tools"), type: "file" as const },
    { name: "commands", src: repoSubdir("commands"), dst: join(globalRoot, "commands"), type: "file" as const },
  ];

  console.log(`Repo:   ${repoSubdir(".")}`);
  console.log(`Global: ${globalRoot}`);
  console.log("");

  for (const section of sections) {
    mkdirSync(section.dst, { recursive: true });

    if (!existsSync(section.src)) {
      console.log(`  warning: source not found: ${section.src}`);
      continue;
    }

    if (section.type === "dir") {
      const dirs = readdirSync(section.src).filter(name =>
        statSync(join(section.src, name)).isDirectory(),
      );
      console.log(`Syncing ${dirs.length} ${section.name}...`);
      for (const name of dirs) {
        const src = join(section.src, name);
        const dst = join(section.dst, name);
        if (opts.dryRun) {
          console.log(`  [dry-run] ${section.name.slice(0, -1)} ${name}`);
        }
        else {
          if (existsSync(dst)) {
            cpSync(src, dst, { recursive: true, force: true });
          }
          else {
            cpSync(src, dst, { recursive: true });
          }
          console.log(`  ok  ${section.name.slice(0, -1)} ${name}`);
        }
      }
    }
    else {
      const files = readdirSync(section.src).filter(name =>
        statSync(join(section.src, name)).isFile(),
      );
      console.log(`Syncing ${files.length} ${section.name}...`);
      for (const name of files) {
        const src = join(section.src, name);
        const dst = join(section.dst, name);
        if (opts.dryRun) {
          console.log(`  [dry-run] ${section.name.slice(0, -1)} ${name}`);
        }
        else {
          cpSync(src, dst);
          console.log(`  ok  ${section.name.slice(0, -1)} ${name}`);
        }
      }
    }
    console.log("");
  }

  if (opts.dryRun) {
    console.log("Dry run complete. Re-run without --dry-run to apply.");
  }
  else {
    console.log("Sync complete. Restart OpenCode (or start a new session) to pick up changes.");
    console.log("Preserved global-only items outside this repo (e.g. custom agents, third-party skills, tools, commands).");
  }
}
