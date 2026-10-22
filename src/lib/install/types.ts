/**
 * Installation modes supported by the installer.
 *
 * - merge: update managed files while preserving user-modified and unmanaged paths
 * - replace: overwrite managed files; unmanaged paths require the force flag
 * - symlink: link repository files into the config root for live editing
 */
export type InstallMode = "merge" | "replace" | "symlink";

/** How a managed file was installed. */
export type ManagedFileMode = "copy" | "symlink";

/** Action the executor performs for a single planned path. */
export type PlannedAction = "create" | "update" | "unchanged" | "keep" | "delete";

/** Why the planner selected an action. */
export type PlanReason
  = | "missing"
    | "managed-update"
    | "managed-unchanged"
    | "adopted"
    | "unmanaged"
    | "modified"
    | "stale"
    | "stale-modified";

/** A file discovered in the source repository. */
export interface SourceFile {
  relativePath: string;
  absolutePath: string;
  hash: string;
  size: number;
}

/** A file owned by the installer according to the manifest. */
export interface ManifestFile {
  hash: string;
  mode: ManagedFileMode;
  installedAt: string;
}

/** Ownership record for files installed into the OpenCode config root. */
export interface Manifest {
  schemaVersion: 1;
  packageVersion: string;
  updatedAt: string;
  files: Record<string, ManifestFile>;
}

/** One source or stale path evaluated by the planner. */
export interface PlannedFile {
  relativePath: string;
  destinationPath: string;
  action: PlannedAction;
  reason: PlanReason;
  sourcePath: string | null;
  sourceHash: string | null;
  previous: ManifestFile | null;
  conflict: boolean;
}

/** Result of planning an installation without touching the filesystem. */
export interface InstallPlan {
  mode: InstallMode;
  force: boolean;
  configRoot: string;
  files: PlannedFile[];
  conflicts: PlannedFile[];
  warnings: string[];
  firstRun: boolean;
  hasChanges: boolean;
}

/** Options accepted by the install command. */
export interface InstallOptions {
  mode?: InstallMode | "copy";
  source?: string;
  dryRun?: boolean;
  skipBackup?: boolean;
  backupPath?: string;
  targetDir?: string;
  force?: boolean;
}

/** Summary returned by the install command. */
export interface InstallResult {
  mode: InstallMode;
  created: number;
  updated: number;
  unchanged: number;
  kept: number;
  deleted: number;
  conflicts: string[];
  backupPath: string | null;
}
