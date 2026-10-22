import type { Manifest, ManifestFile } from "./types";
import { readFile } from "node:fs/promises";
import { join } from "pathe";
import { isNotFoundError, isPlainRecord, writeFileAtomic } from "./utils";

export const MANIFEST_FILE_NAME = ".agent-skills-manifest.json";

/**
 * Returns the manifest path for an OpenCode config root.
 *
 * @param configRoot Absolute OpenCode config root.
 * @returns Absolute manifest path.
 */
export function getManifestPath(configRoot: string): string {
  return join(configRoot, MANIFEST_FILE_NAME);
}

/**
 * Reads and validates the installer manifest.
 *
 * @param configRoot Absolute OpenCode config root.
 * @returns Parsed manifest, or null when no manifest exists.
 * @throws Error when the manifest exists but is not readable as the expected shape.
 */
export async function readManifest(configRoot: string): Promise<Manifest | null> {
  const manifestPath = getManifestPath(configRoot);
  let raw: string;

  try {
    raw = await readFile(manifestPath, "utf-8");
  }
  catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  }
  catch {
    throw new Error(`Manifest is not valid JSON: ${manifestPath}`);
  }

  if (!isManifest(parsed)) {
    throw new Error(`Manifest has an unsupported shape: ${manifestPath}`);
  }

  return parsed;
}

/**
 * Writes the manifest atomically.
 *
 * @param configRoot Absolute OpenCode config root.
 * @param manifest Manifest to persist.
 */
export async function writeManifest(configRoot: string, manifest: Manifest): Promise<void> {
  await writeFileAtomic(
    getManifestPath(configRoot),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

/**
 * Creates an empty manifest for a package version.
 *
 * @param packageVersion Version of the installed package.
 * @returns Empty manifest ready to receive file entries.
 */
export function createManifest(packageVersion: string): Manifest {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    packageVersion,
    updatedAt: now,
    files: {},
  };
}

function isManifest(value: unknown): value is Manifest {
  if (!isPlainRecord(value)) {
    return false;
  }
  if (value.schemaVersion !== 1) {
    return false;
  }
  if (typeof value.packageVersion !== "string" || typeof value.updatedAt !== "string") {
    return false;
  }
  if (!isPlainRecord(value.files)) {
    return false;
  }
  return Object.values(value.files).every(isManifestFile);
}

function isManifestFile(value: unknown): value is ManifestFile {
  return isPlainRecord(value)
    && typeof value.hash === "string"
    && (value.mode === "copy" || value.mode === "symlink")
    && typeof value.installedAt === "string";
}
