import { cp, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { consola } from "consola";
import { pathExists } from "./install/utils";
import { getTimestamp } from "./paths";

export interface BackupOptions {
  configRoot: string;
  backupRoot: string;
  dryRun?: boolean;
  skip?: boolean;
  backupPath?: string;
}

/**
 * Copies the OpenCode config root into a timestamped backup directory.
 *
 * Only the config root is backed up. Compatibility locations such as
 * ~/.agents are not managed by the installer and are therefore untouched.
 *
 * @param opts Backup inputs.
 * @returns Backup directory path, or null when the backup was skipped or
 * there was nothing to back up.
 */
export async function backupGlobal(opts: BackupOptions): Promise<string | null> {
  if (opts.skip) {
    consola.log("  backup skipped (--skip-backup)");
    return null;
  }

  const stamp = getTimestamp();
  const backupDir = opts.backupPath
    ? join(opts.backupPath, stamp)
    : join(opts.backupRoot, stamp);

  if (opts.dryRun) {
    consola.log(`  [dry-run] backup ${opts.configRoot} to ${backupDir}`);
    return backupDir;
  }

  if (!(await pathExists(opts.configRoot))) {
    consola.warn(`Nothing to back up: ${opts.configRoot}`);
    return null;
  }

  await mkdir(backupDir, { recursive: true });

  const items = await readdir(opts.configRoot);
  await Promise.all(
    items
      .filter(item => item !== "node_modules" && item !== "backups")
      .map(async (item) => {
        const sourcePath = join(opts.configRoot, item);
        const destinationPath = join(backupDir, item);
        const itemInfo = await stat(sourcePath);
        if (itemInfo.isDirectory()) {
          await cp(sourcePath, destinationPath, { recursive: true });
        }
        else {
          await cp(sourcePath, destinationPath);
        }
      }),
  );

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const manifest = [
    "# OpenCode Config Backup",
    `Created: ${now}`,
    `Source: ${opts.configRoot}`,
    `Backup: ${backupDir}`,
    "Excluded: node_modules, backups",
    "",
    "## Restore",
    "Copy the backup contents back into the config root:",
    "```bash",
    `cp -r "${backupDir}/." "${opts.configRoot}/"`,
    "```",
    "",
  ].join("\n");
  await writeFile(join(backupDir, "BACKUP.md"), manifest, "utf-8");

  consola.success(`Backup saved: ${backupDir}`);
  return backupDir;
}
