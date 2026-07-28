import { mkdir, readdir, stat, cp, writeFile } from "fs/promises";
import { join } from "pathe";
import { consola } from "consola";
import { getGlobalRoot, getBackupRoot, getTimestamp } from "./paths";

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
  dryRun?: boolean
  skip?: boolean
  backupPath?: string
}

export async function backupGlobal(opts: BackupOptions = {}): Promise<string | null> {
  if (opts.skip && !opts.backupPath) {
    return null;
  }

  const globalRoot = getGlobalRoot();

  if (opts.backupPath) {
    if (!(await exists(opts.backupPath))) {
      throw new Error(`Backup path not found: ${opts.backupPath}`);
    }
    return opts.backupPath;
  }

  const stamp = getTimestamp();
  const backupDir = join(getBackupRoot(), stamp);

  if (opts.dryRun) {
    consola.log(`  [dry-run] backup → ${backupDir}`);
    return backupDir;
  }

  await mkdir(backupDir, { recursive: true });

  if (await exists(globalRoot)) {
    const items = await readdir(globalRoot);
    const copies = items
      .filter(item => item !== "node_modules")
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
    "Excluded: node_modules",
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
