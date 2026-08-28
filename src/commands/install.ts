import { mkdtemp, rm } from "fs/promises";
import { join, resolve, basename } from "pathe";
import { tmpdir } from "os";
import { consola } from "consola";
import { downloadTemplate } from "giget";
import { parseURL } from "ufo";
import { env } from "../lib/env";
import { repoSubdir } from "../lib/paths";
import { deployCommand } from "./deploy";
import { syncCommand } from "./sync";
import { symlinkCommand } from "./symlink";

export type InstallMode = "copy" | "symlink" | "merge";

export interface InstallOptions {
  mode?: InstallMode
  source?: string
  dryRun?: boolean
  skipBackup?: boolean
  backupPath?: string
  targetDir?: string
}

const MODES: InstallMode[] = ["copy", "symlink", "merge"];

function isRemoteSource(source: string): boolean {
  if (/^(github|gh|git|gitlab|bitbucket):/.test(source)) {
    return true;
  }
  const { protocol } = parseURL(source);
  return protocol === "https:" || protocol === "http:";
}

async function resolveRepoRoot(
  source: string | undefined,
): Promise<{ repoRoot: string, cleanup?: () => Promise<void> }> {
  const defaultRoot = repoSubdir(".");
  if (!source) {
    return { repoRoot: defaultRoot };
  }

  if (!isRemoteSource(source)) {
    const abs = resolve(source);
    consola.info(`Source: ${abs} (local path)`);
    return { repoRoot: abs };
  }

  const dir = await mkdtemp(join(tmpdir(), "agent-skills-source-"));
  consola.info(`Source: ${source} (remote template)`);
  const res = await downloadTemplate(source, { dir, force: true });
  consola.info(`Downloaded to: ${res.dir}`);
  return {
    repoRoot: res.dir,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    },
  };
}

export async function installCommand(opts: InstallOptions = {}): Promise<void> {
  const mode = opts.mode ?? "copy";

  if (!MODES.includes(mode)) {
    throw new Error(`Unknown install mode: ${mode}. Use one of: ${MODES.join(", ")}.`);
  }

  const { repoRoot, cleanup } = await resolveRepoRoot(opts.source);
  consola.info(
    `Environment: ${env.platform}${env.ci ? `, CI: ${env.provider}` : ""}`,
  );

  try {
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
  finally {
    if (cleanup) {
      await cleanup();
    }
  }
}

export function describeSource(source: string | undefined): string {
  if (!source) {
    return "local repo (default)";
  }
  return isRemoteSource(source) ? `remote template ${basename(source)}` : `local path ${resolve(source)}`;
}
