import { consola } from "consola";
import { resolve } from "pathe";
import { env } from "../lib/env";
import { repoSubdir } from "../lib/paths";
import { deployCommand } from "./deploy";
import { symlinkCommand } from "./symlink";
import { syncCommand } from "./sync";

export type InstallMode = "copy" | "symlink" | "merge";

export interface InstallOptions {
  mode?: InstallMode;
  source?: string;
  dryRun?: boolean;
  skipBackup?: boolean;
  backupPath?: string;
  targetDir?: string;
}

const MODES: InstallMode[] = ["copy", "symlink", "merge"];

function isRemoteSource(source: string): boolean {
  return /^(?:github|gh|git|gitlab|bitbucket):/.test(source)
    || /^https?:\/\//i.test(source);
}

function resolveRepoRoot(source: string | undefined): string {
  const defaultRoot = repoSubdir(".");
  if (!source) {
    return defaultRoot;
  }

  if (isRemoteSource(source)) {
    throw new Error("Remote source installation is not supported. Clone the repository and provide a local path.");
  }

  const abs = resolve(source);
  consola.info(`Source: ${abs} (local path)`);
  return abs;
}

export async function installCommand(opts: InstallOptions = {}): Promise<void> {
  const mode = opts.mode ?? "copy";

  if (!MODES.includes(mode)) {
    throw new Error(`Unknown install mode: ${mode}. Use one of: ${MODES.join(", ")}.`);
  }

  const repoRoot = resolveRepoRoot(opts.source);
  consola.info(
    `Environment: ${env.platform}${env.ci ? `, CI: ${env.provider}` : ""}`,
  );

  switch (mode) {
    case "copy":
      consola.info("Install mode: copy (backup, overwrite, config merge)");
      await deployCommand({
        repoRoot,
        dryRun: opts.dryRun,
        skipBackup: opts.skipBackup,
        backupPath: opts.backupPath,
        targetDir: opts.targetDir,
      });
      break;
    case "symlink":
      consola.info("Install mode: symlink (live editing via links)");
      await symlinkCommand({
        repoRoot,
        dryRun: opts.dryRun,
        targetDir: opts.targetDir,
      });
      break;
    case "merge":
      consola.info("Install mode: merge (copy over, preserve global-only items)");
      await syncCommand({
        repoRoot,
        dryRun: opts.dryRun,
        targetDir: opts.targetDir,
      });
      break;
  }
}

export function describeSource(source: string | undefined): string {
  if (!source) {
    return "local repo (default)";
  }
  return `local path ${resolve(source)}`;
}
