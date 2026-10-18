import { cp, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { consola } from "consola";
import { join } from "pathe";
import { getBackupRoot, getGlobalRoot, getTimestamp } from "./paths";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch {
    return false;
  }
}

export interface BackupOptions {
  dryRun?: boolean;
  skip?: boolean;
  backupPath?: string;
  targetDir?: string;
}

export async function backupGlobal(opts: BackupOptions = {}): Promise<string | null> {
  if (opts.skip && !opts.backupPath) {
    return null;
  }

  const globalRoot = getGlobalRoot(opts.targetDir);

  if (opts.backupPath) {
    if (!(await exists(opts.backupPath))) {
      throw new Error(`Backup path not found: ${opts.backupPath}`);
    }
    return opts.backupPath;
  }

  const stamp = getTimestamp();
  const backupDir = join(getBackupRoot(opts.targetDir), stamp);

  if (opts.dryRun) {
    consola.log(`  [dry-run] backup to ${backupDir}`);
    return backupDir;
  }

  await mkdir(backupDir, { recursive: true });

  if (await exists(globalRoot)) {
    const items = await readdir(globalRoot);
    const copies = items
      .filter(item => item !== "node_modules" && item !== "backups")
      .map(async (item) => {
        const src = join(globalRoot, item);
        const dst = join(backupDir, item);
        if ((await stat(src)).isDirectory()) {
          await cp(src, dst, { recursive: true });
        }
        else {
          await cp(src, dst);
        }
      });
    await Promise.all(copies);
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const manifest = [
    "# OpenCode Global Config Backup",
    `Created: ${now}`,
    `Source: ${globalRoot}`,
    `Backup: ${backupDir}`,
    "Excluded: node_modules, backups",
    "",
    "## Restore",
    "```bash",
    `cp -r "${backupDir}"/* "${globalRoot}/"`,
    "```",
    "",
  ].join("\n");
  await writeFile(join(backupDir, "BACKUP.md"), manifest, "utf-8");

  consola.success(`Backup saved: ${backupDir}`);
  return backupDir;
}
