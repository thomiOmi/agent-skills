import type { SourceFile } from "./types";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, sep } from "node:path";

const IGNORED_NAMES = new Set([".DS_Store", ".git", "Thumbs.db", "node_modules"]);

interface SourceMount {
  sourcePath: string;
  destinationPrefix: string;
}

/**
 * Returns the repository paths that the installer publishes and the prefix
 * each path receives inside the OpenCode config root.
 *
 * @param repoRoot Absolute path to the cloned repository.
 * @returns Source mounts in deterministic order.
 */
export function getSourceMounts(repoRoot: string): SourceMount[] {
  return [
    { sourcePath: join(repoRoot, "agents"), destinationPrefix: "agents" },
    { sourcePath: join(repoRoot, "skills"), destinationPrefix: "skills" },
    { sourcePath: join(repoRoot, "commands"), destinationPrefix: "commands" },
    { sourcePath: join(repoRoot, "plugin"), destinationPrefix: "plugins" },
    {
      sourcePath: join(repoRoot, "instructions", "AGENTS.md"),
      destinationPrefix: "AGENTS.md",
    },
  ];
}

/**
 * Hashes a file with SHA-256 so the planner can detect local modifications.
 *
 * @param path Absolute file path.
 * @returns Lowercase hexadecimal digest.
 */
export async function hashFile(path: string): Promise<string> {
  const content = await readFile(path);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Collects every published file from the repository.
 *
 * @param repoRoot Absolute path to the cloned repository.
 * @returns Sorted source files with relative destination paths.
 * @throws Error when a required source directory or file is missing.
 */
export async function collectSourceFiles(repoRoot: string): Promise<SourceFile[]> {
  const files: SourceFile[] = [];

  for (const mount of getSourceMounts(repoRoot)) {
    let mountInfo;
    try {
      mountInfo = await stat(mount.sourcePath);
    }
    catch {
      throw new Error(`Missing source: ${mount.sourcePath}`);
    }

    if (mountInfo.isDirectory()) {
      await scanDirectory(mount.sourcePath, mount.destinationPrefix, files);
    }
    else {
      files.push(await describeSourceFile(mount.sourcePath, mount.destinationPrefix));
    }
  }

  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function scanDirectory(
  directory: string,
  destinationPrefix: string,
  files: SourceFile[],
): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_NAMES.has(entry.name)) {
      continue;
    }

    const absolutePath = join(directory, entry.name);
    const relativePath = join(destinationPrefix, entry.name).split(sep).join("/");

    if (entry.isDirectory()) {
      await scanDirectory(absolutePath, relativePath, files);
      continue;
    }

    if (entry.isFile() || entry.isSymbolicLink()) {
      files.push(await describeSourceFile(absolutePath, relativePath));
    }
  }
}

async function describeSourceFile(absolutePath: string, relativePath: string): Promise<SourceFile> {
  const content = await readFile(absolutePath);
  return {
    relativePath,
    absolutePath,
    hash: createHash("sha256").update(content).digest("hex"),
    size: content.byteLength,
  };
}
