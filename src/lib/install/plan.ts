import type {
  InstallMode,
  InstallPlan,
  Manifest,
  ManifestFile,
  PlannedFile,
  SourceFile,
} from "./types";
import { lstat, stat } from "node:fs/promises";
import { hashFile } from "./scan";
import { resolveInsideRoot } from "./targets";
import { isNotFoundError } from "./utils";

export interface BuildPlanOptions {
  mode: InstallMode;
  force: boolean;
  configRoot: string;
  sourceFiles: SourceFile[];
  manifest: Manifest | null;
}

interface DestinationState {
  exists: boolean;
  isDirectory: boolean;
  isBrokenSymlink: boolean;
  hash: string | null;
}

/**
 * Builds an installation plan by comparing source files, the ownership
 * manifest, and the current destination contents.
 *
 * The planner performs read-only filesystem access. Nothing is written until
 * the executor accepts the plan.
 *
 * @param options Planner inputs.
 * @returns Plan with actions, conflicts, and human-readable warnings.
 */
export async function buildInstallPlan(options: BuildPlanOptions): Promise<InstallPlan> {
  const orderedSources = [...options.sourceFiles].sort(
    (left, right) => left.relativePath.localeCompare(right.relativePath),
  );
  const manifestFiles = options.manifest?.files ?? {};
  const firstRun = options.manifest === null;
  const planned: PlannedFile[] = [];
  let adopted = false;

  for (const source of orderedSources) {
    const destinationPath = resolveInsideRoot(options.configRoot, source.relativePath);
    const destination = await inspectDestination(destinationPath);
    const previous = manifestFiles[source.relativePath] ?? null;
    const file = planSourceFile(
      source,
      destinationPath,
      destination,
      previous,
      options.mode,
      options.force,
      firstRun,
    );

    if (previous === null && (file.reason === "adopted" || file.action === "unchanged")) {
      adopted = true;
    }

    planned.push(file);
  }

  const sourcePaths = new Set(orderedSources.map(file => file.relativePath));
  const stalePaths = Object.keys(manifestFiles)
    .filter(relativePath => !sourcePaths.has(relativePath))
    .sort((left, right) => left.localeCompare(right));

  for (const relativePath of stalePaths) {
    const previous = manifestFiles[relativePath];
    if (!previous) {
      continue;
    }

    const destinationPath = resolveInsideRoot(options.configRoot, relativePath);
    const destination = await inspectDestination(destinationPath);
    const staleFile = planStaleFile(
      relativePath,
      destinationPath,
      destination,
      previous,
      options.mode,
      options.force,
    );

    if (staleFile) {
      planned.push(staleFile);
    }
  }

  const warnings = buildWarnings(planned, firstRun && adopted);
  const conflicts = planned.filter(file => file.conflict);

  return {
    mode: options.mode,
    force: options.force,
    configRoot: options.configRoot,
    files: planned,
    conflicts,
    warnings,
    firstRun,
    hasChanges: planned.some(
      file => file.action === "create" || file.action === "update" || file.action === "delete",
    ),
  };
}

function planSourceFile(
  source: SourceFile,
  destinationPath: string,
  destination: DestinationState,
  previous: ManifestFile | null,
  mode: InstallMode,
  force: boolean,
  firstRun: boolean,
): PlannedFile {
  const base = {
    relativePath: source.relativePath,
    destinationPath,
    sourcePath: source.absolutePath,
    sourceHash: source.hash,
    previous,
    conflict: false,
  };

  if (!destination.exists) {
    return { ...base, action: "create", reason: "missing" };
  }

  if (destination.isDirectory || destination.isBrokenSymlink) {
    if (mode !== "merge" && force) {
      return { ...base, action: "update", reason: "unmanaged", conflict: true };
    }
    return { ...base, action: "keep", reason: "unmanaged", conflict: true };
  }

  if (destination.hash === source.hash) {
    return {
      ...base,
      action: "unchanged",
      reason: previous ? "managed-unchanged" : "adopted",
    };
  }

  if (previous) {
    if (destination.hash === previous.hash) {
      return { ...base, action: "update", reason: "managed-update" };
    }
    if (mode !== "merge") {
      return { ...base, action: "update", reason: "modified" };
    }
    return { ...base, action: "keep", reason: "modified", conflict: true };
  }

  if (firstRun) {
    return { ...base, action: "update", reason: "adopted" };
  }

  if (mode !== "merge" && force) {
    return { ...base, action: "update", reason: "unmanaged", conflict: true };
  }

  return { ...base, action: "keep", reason: "unmanaged", conflict: true };
}

function planStaleFile(
  relativePath: string,
  destinationPath: string,
  destination: DestinationState,
  previous: ManifestFile,
  mode: InstallMode,
  force: boolean,
): PlannedFile | null {
  if (!destination.exists) {
    return null;
  }

  const base = {
    relativePath,
    destinationPath,
    sourcePath: null,
    sourceHash: null,
    previous,
    conflict: false,
  };

  if (destination.isDirectory || destination.isBrokenSymlink) {
    return { ...base, action: "keep", reason: "unmanaged" };
  }

  if (destination.hash === previous.hash) {
    return { ...base, action: "delete", reason: "stale" };
  }

  if (mode !== "merge" && force) {
    return { ...base, action: "delete", reason: "stale-modified" };
  }

  return { ...base, action: "keep", reason: "stale-modified" };
}

function buildWarnings(planned: PlannedFile[], adoptedExistingInstall: boolean): string[] {
  const warnings: string[] = [];

  if (adoptedExistingInstall) {
    warnings.push(
      "No manifest found. Existing files at shipped paths are adopted and updated; a backup is created before writing.",
    );
  }

  for (const file of planned) {
    if (file.action !== "keep") {
      continue;
    }

    if (file.reason === "modified") {
      warnings.push(`Preserved user-modified file: ${file.relativePath}`);
    }
    else if (file.reason === "unmanaged") {
      warnings.push(`Preserved unmanaged path: ${file.relativePath}`);
    }
    else if (file.reason === "stale-modified") {
      warnings.push(`Preserved modified file that is no longer shipped: ${file.relativePath}`);
    }
  }

  return warnings;
}

async function inspectDestination(path: string): Promise<DestinationState> {
  try {
    await lstat(path);
  }
  catch (error) {
    if (isNotFoundError(error)) {
      return { exists: false, isDirectory: false, isBrokenSymlink: false, hash: null };
    }
    throw error;
  }

  try {
    const info = await stat(path);
    if (info.isDirectory()) {
      return { exists: true, isDirectory: true, isBrokenSymlink: false, hash: null };
    }
    return {
      exists: true,
      isDirectory: false,
      isBrokenSymlink: false,
      hash: await hashFile(path),
    };
  }
  catch (error) {
    if (isNotFoundError(error)) {
      return { exists: true, isDirectory: false, isBrokenSymlink: true, hash: null };
    }
    throw error;
  }
}
