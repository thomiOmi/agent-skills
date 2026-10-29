import { isAbsolute, relative, resolve } from "node:path";
import { getBackupRoot, getGlobalRoot } from "../paths";

export interface ResolvedTargets {
  configRoot: string;
  backupRoot: string;
}

/**
 * Resolves the OpenCode config root and the backup root for an installation.
 *
 * The installer writes only to the OpenCode config root. Compatibility
 * locations such as ~/.agents are intentionally not managed.
 *
 * @param targetOverride Optional sandbox directory used by tests and dry runs.
 * @returns Absolute config and backup roots.
 */
export function resolveTargets(targetOverride?: string): ResolvedTargets {
  return {
    configRoot: getGlobalRoot(targetOverride),
    backupRoot: getBackupRoot(targetOverride),
  };
}

/**
 * Resolves a relative path inside a root and rejects any path that escapes it.
 *
 * @param root Absolute root directory.
 * @param relativePath Path relative to the root.
 * @returns Absolute destination path guaranteed to stay inside the root.
 * @throws Error when the resolved path escapes the root.
 */
export function resolveInsideRoot(root: string, relativePath: string): string {
  const destination = resolve(root, relativePath);
  const fromRoot = relative(root, destination);

  if (fromRoot === "" || fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
    throw new Error(`Refusing to write outside ${root}: ${relativePath}`);
  }

  return destination;
}
