import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";

describe("Package distribution", () => {
  it("includes every source directory required by the installer", async () => {
    const packagePath = join(import.meta.dir, "..", "package.json");
    const packageManifest = JSON.parse(await readFile(packagePath, "utf-8")) as {
      files?: string[];
    };

    const packageFiles = new Set(packageManifest.files ?? []);
    const installerSources = [
      "agents",
      "commands",
      "config",
      "instructions",
      "plugin",
      "skills",
      "src",
      "AGENTS.md",
    ];

    for (const source of installerSources) {
      expect(packageFiles.has(source)).toBe(true);
    }
  });
});
