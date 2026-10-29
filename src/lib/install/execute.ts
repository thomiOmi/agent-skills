import type { PreparedConfigs } from "./config-merge";
import type {
  InstallMode,
  InstallPlan,
  ManagedFileMode,
  Manifest,
  PlannedFile,
} from "./types";
import { chmod, cp, mkdir, rename, rm, stat, symlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";
import { consola } from "consola";
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

  if (mode === "symlink") {
    return createSymlinkOrCopy(file.sourcePath, file.destinationPath);
  }

  const destinationDir = dirname(file.destinationPath);
  const temporaryPath = join(destinationDir, `.agent-skills-tmp-${file.relativePath.replace(/\//g, "_")}`);

  try {
    await cp(file.sourcePath, temporaryPath, { recursive: true });
    await preserveMode(file.sourcePath, temporaryPath);
    await rename(temporaryPath, file.destinationPath);
  }
  catch {
    await rm(temporaryPath, { force: true });
    throw new Error(`Failed to install ${file.relativePath}`);
  }

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
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let kept = 0;
  let deleted = 0;

  for (const file of plan.files) {
    switch (file.action) {
      case "create":
        created++;
        break;
      case "update":
        updated++;
        break;
      case "unchanged":
        unchanged++;
        break;
      case "keep":
        kept++;
        break;
      case "delete":
        deleted++;
        break;
    }
  }

  return {
    created,
    updated,
    unchanged,
    kept,
    deleted,
    backupPath,
  };
}
