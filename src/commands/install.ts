import { consola } from "consola";
import { deployCommand } from "./deploy";
import { syncCommand } from "./sync";
import { symlinkCommand } from "./symlink";

export type InstallMode = "copy" | "symlink" | "merge";

export interface InstallOptions {
  mode?: InstallMode
  dryRun?: boolean
  skipBackup?: boolean
  backupPath?: string
  targetDir?: string
}

const MODES: InstallMode[] = ["copy", "symlink", "merge"];

export async function installCommand(opts: InstallOptions = {}): Promise<void> {
  const mode = opts.mode ?? "copy";

  if (!MODES.includes(mode)) {
    throw new Error(`Unknown install mode: ${mode}. Use one of: ${MODES.join(", ")}.`);
  }

  switch (mode) {
    case "copy":
      consola.info("Install mode: copy (backup, overwrite, config merge)");
      await deployCommand({
        dryRun: opts.dryRun,
        skipBackup: opts.skipBackup,
        backupPath: opts.backupPath,
        targetDir: opts.targetDir,
      });
      break;
    case "symlink":
      consola.info("Install mode: symlink (live editing via links)");
      await symlinkCommand({
        dryRun: opts.dryRun,
        targetDir: opts.targetDir,
      });
      break;
    case "merge":
      consola.info("Install mode: merge (copy over, preserve global-only items)");
      await syncCommand({
        dryRun: opts.dryRun,
        targetDir: opts.targetDir,
      });
      break;
  }
}
