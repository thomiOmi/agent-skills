import type {
  InstallMode,
  InstallOptions,
  InstallResult,
  Manifest,
  PlannedFile,
} from "../lib/install/types";
import { consola } from "consola";
import { join, resolve } from "pathe";
import { readPackageJSON } from "pkg-types";
import { prepareConfigs } from "../lib/config";
import { env } from "../lib/env";
import { executeInstall } from "../lib/install/execute";
import { readManifest } from "../lib/install/manifest";
import { buildInstallPlan } from "../lib/install/plan";
import { collectSourceFiles } from "../lib/install/scan";
import { resolveTargets } from "../lib/install/targets";
import { repoSubdir } from "../lib/paths";

export type { InstallMode, InstallOptions, InstallResult } from "../lib/install/types";

const MODES: InstallMode[] = ["merge", "replace", "symlink"];

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

  const absolutePath = resolve(source);
  consola.info(`Source: ${absolutePath} (local path)`);
  return absolutePath;
}

function normalizeMode(mode: InstallOptions["mode"]): InstallMode {
  if (mode === undefined) {
    return "merge";
  }

  if (mode === "copy") {
    consola.warn("Install mode 'copy' is deprecated; using 'replace'. Pass --mode replace explicitly.");
    return "replace";
  }

  if (!MODES.includes(mode)) {
    throw new Error(`Unknown install mode: ${mode}. Use one of: ${[...MODES, "copy"].join(", ")}.`);
  }

  return mode;
}

async function readPackageVersion(repoRoot: string): Promise<string> {
  try {
    const packageJson = await readPackageJSON(join(repoRoot, "package.json"));
    return packageJson.version ?? "0.0.0";
  }
  catch {
    return "0.0.0";
  }
}

async function readManifestSafe(configRoot: string, force: boolean): Promise<Manifest | null> {
  try {
    return await readManifest(configRoot);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!force) {
      throw new Error(
        `${message}\nFix or remove the manifest, or pass --force to adopt the existing installation.`,
      );
    }
    consola.warn(`${message} Continuing because --force is set.`);
    return null;
  }
}

function formatConflictError(conflicts: PlannedFile[]): string {
  const paths = conflicts.map(file => `  - ${file.relativePath}`).join("\n");
  return [
    "Installation aborted: the installer does not own these paths:",
    paths,
    "Re-run with --force to overwrite them after a backup, or use --mode merge to preserve them.",
  ].join("\n");
}

/**
 * Installs the catalog into the OpenCode config root.
 *
 * @param opts Install options.
 * @returns Action counts and conflict list.
 * @throws Error when the mode is unknown, the source is remote, the manifest
 * is corrupt without force, a config cannot be parsed without force, or
 * replace mode finds unmanaged paths without force.
 */
export async function installCommand(opts: InstallOptions = {}): Promise<InstallResult> {
  const mode = normalizeMode(opts.mode);
  const repoRoot = resolveRepoRoot(opts.source);
  const targets = resolveTargets(opts.targetDir);
  const dryRun = opts.dryRun ?? false;
  const force = opts.force ?? false;

  consola.info(`Environment: ${env.platform}${env.ci ? `, CI: ${env.provider}` : ""}`);
  consola.info(`Repo:   ${repoRoot}`);
  consola.info(`Global: ${targets.configRoot}`);
  consola.info(`Mode:   ${mode}${dryRun ? " (dry run)" : ""}`);
  consola.info("Target: OpenCode config root only (~/.agents is not managed)");

  const packageVersion = await readPackageVersion(repoRoot);
  const sourceFiles = await collectSourceFiles(repoRoot);
  const manifest = await readManifestSafe(targets.configRoot, force);
  const plan = await buildInstallPlan({
    mode,
    force,
    configRoot: targets.configRoot,
    sourceFiles,
    manifest,
  });

  if (mode !== "merge" && plan.conflicts.length > 0 && !force) {
    throw new Error(formatConflictError(plan.conflicts));
  }

  const configs = await prepareConfigs(repoRoot, targets.configRoot, { force });
  const result = await executeInstall({
    plan,
    configs,
    backupRoot: targets.backupRoot,
    packageVersion,
    manifest,
    dryRun,
    skipBackup: opts.skipBackup ?? false,
    backupPath: opts.backupPath,
  });

  for (const warning of [...plan.warnings, ...configs.openCode.warnings, ...configs.tui.warnings]) {
    consola.warn(warning);
  }

  consola.log("\n==> Done");
  consola.log(`  created:   ${result.created}`);
  consola.log(`  updated:   ${result.updated}`);
  consola.log(`  unchanged: ${result.unchanged}`);
  consola.log(`  kept:      ${result.kept}`);
  consola.log(`  deleted:   ${result.deleted}`);
  if (result.backupPath) {
    consola.info(`  backup:    ${result.backupPath}`);
  }
  if (dryRun) {
    consola.info("  dry run: no files were written");
  }
  else {
    consola.info("Restart OpenCode (or open a new session) to load the new setup.");
  }

  return {
    mode,
    ...result,
    conflicts: plan.conflicts.map(file => file.relativePath),
  };
}

/**
 * Describes the install source for help output.
 *
 * @param source Source argument supplied by the user.
 * @returns Human-readable source description.
 */
export function describeSource(source: string | undefined): string {
  if (!source) {
    return "local repo (default)";
  }
  return `local path ${resolve(source)}`;
}
