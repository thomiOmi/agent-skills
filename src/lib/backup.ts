import { existsSync, mkdirSync, cpSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { getGlobalRoot, getBackupRoot, getTimestamp } from "./paths";

export interface BackupOptions {
  dryRun?: boolean
  skip?: boolean
  backupPath?: string
}

export function backupGlobal(opts: BackupOptions = {}): string | null {
  if (opts.skip && !opts.backupPath) {
    return null;
  }

  const globalRoot = getGlobalRoot();

  if (opts.backupPath) {
    if (!existsSync(opts.backupPath)) {
      throw new Error(`Backup path not found: ${opts.backupPath}`);
    }
    return opts.backupPath;
  }

  const stamp = getTimestamp();
  const backupDir = join(getBackupRoot(), stamp);

  if (opts.dryRun) {
    console.log(`  [dry-run] backup → ${backupDir}`);
    return backupDir;
  }

  mkdirSync(backupDir, { recursive: true });

  if (existsSync(globalRoot)) {
    const items = readdirSync(globalRoot);
    for (const item of items) {
      if (item === "node_modules") continue;
      const src = join(globalRoot, item);
      const dst = join(backupDir, item);
      if (statSync(src).isDirectory()) {
        cpSync(src, dst, { recursive: true });
      }
      else {
        cpSync(src, dst);
      }
    }
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const manifest = [
    "# OpenCode Global Config Backup",
    `Created: ${now}`,
    `Source: ${globalRoot}`,
    `Backup: ${backupDir}`,
    "Excluded: node_modules",
    "",
    "## Restore",
    "```bash",
    `cp -r "${backupDir}"/* "${globalRoot}/"`,
    "```",
    "",
  ].join("\n");
  writeFileSync(join(backupDir, "BACKUP.md"), manifest, "utf-8");

  console.log(`  Backup saved: ${backupDir}`);
  return backupDir;
}
