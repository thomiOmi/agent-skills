import type { PreparedConfigs } from "./config-merge";
import type {
  InstallMode,
  InstallPlan,
  ManagedFileMode,
  Manifest,
  PlannedFile,
} from "./types";
import { chmod, cp, mkdir, rm, stat, symlink } from "node:fs/promises";
import process from "node:process";
import { consola } from "consola";
import { dirname } from "pathe";
import { backupGlobal } from "../backup";
import { writeConfigFile } from "./config-merge";
import { createManifest, getManifestPath, writeManifest } from "./manifest";

export interface ExecuteInstallOptions {
  plan: InstallPlan;
  configs: PreparedConfigs;
  backupRoot: string;
  packageVersion: string;
  manifest: Manifest | null;
  dryRun: boolean;
  skipBackup: boolean;
  backupPath?: string;
}

export interface ExecuteInstallResult {
  created: number;
  updated: number;
  unchanged: number;
  kept: number;
  deleted: number;
  backupPath: string | null;
}

/**
 * Applies an installation plan and writes the new ownership manifest.
 *
 * The backup runs before the first write. File actions run before
 * configuration writes so a configuration parse error can never leave a
 * partially updated catalog behind.
 *
 * @param options Execution inputs.
 * @returns Action counts and the backup path.
 */
export async function executeInstall(
  options: ExecuteInstallOptions,
): Promise<ExecuteInstallResult> {
  const { plan, configs, dryRun } = options;
  const needsBackup = plan.hasChanges || configs.openCode.changed || configs.tui.changed;
  const backupPath = needsBackup && !options.skipBackup
    ? await backupGlobal({
        configRoot: plan.configRoot,
        backupRoot: options.backupRoot,
        dryRun,
        backupPath: options.backupPath,
      })
    : null;

  if (dryRun) {
    logDryRun(plan);
    return countPlan(plan, backupPath);
  }

  const installedModes = new Map<string, ManagedFileMode>();

  for (const file of plan.files) {
    if (file.action === "create" || file.action === "update") {
      installedModes.set(file.relativePath, await installFile(file, plan.mode));
    }
    else if (file.action === "delete") {
      await rm(file.destinationPath, { recursive: true, force: true });
      consola.log(`  delete ${file.relativePath}`);
    }
    else if (file.action === "keep") {
      consola.log(`  keep   ${file.relativePath}`);
    }
  }

  if (configs.openCode.changed) {
    await writeConfigFile(configs.openCode.path, configs.openCode.value, false);
  }
  if (configs.tui.changed) {
    await writeConfigFile(configs.tui.path, configs.tui.value, false);
  }

  await persistManifest(options, installedModes);

  return countPlan(plan, backupPath);
}

async function installFile(
  file: PlannedFile,
  mode: InstallMode,
): Promise<ManagedFileMode> {
  if (!file.sourcePath) {
    throw new Error(`Missing source path for ${file.relativePath}`);
  }

  await mkdir(dirname(file.destinationPath), { recursive: true });

  if (file.action === "update") {
    await rm(file.destinationPath, { recursive: true, force: true });
  }

  if (mode === "symlink") {
    return createSymlinkOrCopy(file.sourcePath, file.destinationPath);
  }

  await cp(file.sourcePath, file.destinationPath);
  await preserveMode(file.sourcePath, file.destinationPath);
  consola.log(`  ${file.action === "create" ? "create" : "update"} ${file.relativePath}`);
  return "copy";
}

async function createSymlinkOrCopy(
  sourcePath: string,
  destinationPath: string,
): Promise<ManagedFileMode> {
  const sourceInfo = await stat(sourcePath);
  const linkType = sourceInfo.isDirectory()
    ? process.platform === "win32" ? "junction" : "dir"
    : "file";

  try {
    await symlink(sourcePath, destinationPath, linkType);
    consola.log(`  symlink ${destinationPath}`);
    return "symlink";
  }
  catch {
    // Windows may block symlink creation without developer mode. Copying is a
    // safe fallback because the manifest records the actual installed mode.
    await cp(sourcePath, destinationPath, { recursive: sourceInfo.isDirectory() });
    await preserveMode(sourcePath, destinationPath);
    consola.log(`  copy    ${destinationPath}`);
    return "copy";
  }
}

async function preserveMode(sourcePath: string, destinationPath: string): Promise<void> {
  if (process.platform === "win32") {
    return;
  }

  const sourceInfo = await stat(sourcePath);
  await chmod(destinationPath, sourceInfo.mode);
}

async function persistManifest(
  options: ExecuteInstallOptions,
  installedModes: Map<string, ManagedFileMode>,
): Promise<void> {
  const { plan } = options;
  const shouldWrite = plan.firstRun
    || plan.hasChanges
    || plan.files.some(file => file.action === "unchanged" && file.previous === null);

  if (!shouldWrite) {
    return;
  }

  const nextManifest = createManifest(options.packageVersion);
  const now = new Date().toISOString();

  for (const file of plan.files) {
    if (file.action === "delete") {
      continue;
    }

    if (file.action === "keep") {
      if (file.previous) {
        nextManifest.files[file.relativePath] = file.previous;
      }
      continue;
    }

    if (file.sourceHash === null) {
      continue;
    }

    nextManifest.files[file.relativePath] = {
      hash: file.sourceHash,
      mode: installedModes.get(file.relativePath) ?? file.previous?.mode ?? "copy",
      installedAt: file.action === "update"
        ? now
        : file.previous?.installedAt ?? now,
    };
  }

  nextManifest.updatedAt = now;
  await writeManifest(plan.configRoot, nextManifest);
  consola.success(`ok  ${getManifestPath(plan.configRoot)}`);
}

function logDryRun(plan: InstallPlan): void {
  for (const file of plan.files) {
    const label = file.action === "keep" ? "keep  " : file.action === "create" ? "create" : file.action;
    consola.log(`  [dry-run] ${label} ${file.relativePath}`);
  }
}

function countPlan(
  plan: InstallPlan,
  backupPath: string | null,
): ExecuteInstallResult {
  return {
    created: plan.files.filter(file => file.action === "create").length,
    updated: plan.files.filter(file => file.action === "update").length,
    unchanged: plan.files.filter(file => file.action === "unchanged").length,
    kept: plan.files.filter(file => file.action === "keep").length,
    deleted: plan.files.filter(file => file.action === "delete").length,
    backupPath,
  };
}
