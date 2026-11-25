import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import process from "node:process";

/**
 * Returns true when a filesystem error means the requested path does not exist.
 *
 * @param error Value thrown by a filesystem call.
 * @returns True for ENOENT-style errors.
 */
export function isNotFoundError(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && (error as { code?: unknown }).code === "ENOENT";
}

/**
 * Returns true when the path exists, without throwing for a missing path.
 *
 * @param path Absolute path to inspect.
 * @returns True when the path exists.
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch (error) {
    if (isNotFoundError(error)) {
      return false;
    }
    throw error;
  }
}

/**
 * Writes a file atomically by renaming a temporary file over the destination.
 *
 * @param path Destination file path.
 * @param content File content to write.
 */
export async function writeFileAtomic(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, content, "utf-8");
  try {
    await rename(temporaryPath, path);
  }
  catch (error) {
    if (!isRenameOverwriteConflict(error)) {
      throw error;
    }

    // Windows can reject a rename over an existing file. Removing the
    // destination is only safe once the complete temporary file exists.
    await rm(path, { force: true });
    await rename(temporaryPath, path);
  }
}

/**
 * Reports whether an error is a Windows rename conflict with an existing file.
 *
 * @param error Value thrown by a rename call.
 * @returns True for EPERM or EEXIST on Windows.
 */
function isRenameOverwriteConflict(error: unknown): boolean {
  if (process.platform !== "win32" || typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  return code === "EPERM" || code === "EEXIST";
}

/**
 * Compares two paths by Unicode code point for locale-independent ordering.
 *
 * @param left First path.
 * @param right Second path.
 * @returns Negative when left sorts first, positive when right sorts first,
 * and zero when the paths are equal.
 */
export function comparePaths(left: string, right: string): number {
  const leftPoints = [...left].map(character => character.codePointAt(0) ?? 0);
  const rightPoints = [...right].map(character => character.codePointAt(0) ?? 0);
  const sharedLength = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < sharedLength; index++) {
    const difference = (leftPoints[index] ?? 0) - (rightPoints[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }

  return leftPoints.length - rightPoints.length;
}

/**
 * Returns true when the value is a non-null object that is not an array.
 *
 * @param value Value to inspect.
 * @returns True for plain JSON objects.
 */
export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Compares two JSON-compatible values by structure, not by reference.
 *
 * @param left First value.
 * @param right Second value.
 * @returns True when both values have the same structure and content.
 */
export function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
      return false;
    }
    return left.every((value, index) => deepEqual(value, right[index]));
  }

  if (isPlainRecord(left) && isPlainRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    return leftKeys.every(key => key in right && deepEqual(left[key], right[key]));
  }

  return false;
}
