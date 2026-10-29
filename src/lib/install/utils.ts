import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

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
  catch {
    // Windows can reject a rename over an existing file. Remove only the
    // destination file after the complete temporary file already exists.
    await rm(path, { force: true });
    await rename(temporaryPath, path);
  }
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
