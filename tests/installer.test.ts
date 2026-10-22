import type { ConfigEnvironmentSnapshot, InstallerFixture } from "./installer-fixture";
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { parseJSONC } from "confbox";
import { join } from "pathe";
import { describeSource, installCommand } from "../src/commands/install";
import { pathExists } from "../src/lib/install/utils";
import {
  createInstallerFixture,
  isolateConfigEnvironment,
  removeInstallerFixture,
  writeFixtureFile,
} from "./installer-fixture";

const fixtures: InstallerFixture[] = [];
const environmentSnapshots: ConfigEnvironmentSnapshot[] = [];

beforeEach(() => {
  environmentSnapshots.push(isolateConfigEnvironment());
});

afterEach(async () => {
  environmentSnapshots.pop()?.restore();
  await Promise.all(fixtures.splice(0).map(removeInstallerFixture));
});

async function createFixture(): Promise<InstallerFixture> {
  const fixture = await createInstallerFixture();
  fixtures.push(fixture);
  return fixture;
}

async function readConfig(root: string): Promise<Record<string, unknown>> {
  const raw = await readFile(join(root, "opencode.jsonc"), "utf-8");
  return parseJSONC(raw) as Record<string, unknown>;
}

describe("Installer commands", () => {
  it("defaults to merge mode and writes files, config, and a manifest", async () => {
    const fixture = await createFixture();

    const result = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(result.mode).toBe("merge");
    expect(await pathExists(join(fixture.target, "agents"))).toBe(true);
    expect(await pathExists(join(fixture.target, "skills"))).toBe(true);
    expect(await pathExists(join(fixture.target, "commands"))).toBe(true);
    expect(await pathExists(join(fixture.target, "plugins"))).toBe(true);
    expect(await pathExists(join(fixture.target, "AGENTS.md"))).toBe(true);
    expect(await pathExists(join(fixture.target, "opencode.jsonc"))).toBe(true);
    expect(await pathExists(join(fixture.target, "tui.jsonc"))).toBe(true);
    expect(await pathExists(join(fixture.target, ".agent-skills-manifest.json")))
      .toBe(true);

    const config = await readConfig(fixture.target);
    expect(config.instructions).toEqual(["AGENTS.md"]);
    expect(config.experimental).toEqual({ subagent_depth: 2 });
    expect(config.OPENCODE).toBeUndefined();

    const manifest = JSON.parse(
      await readFile(join(fixture.target, ".agent-skills-manifest.json"), "utf-8"),
    ) as { schemaVersion: number; packageVersion: string; files: Record<string, unknown> };
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.packageVersion).toBe("9.9.9");
    expect(Object.keys(manifest.files).length).toBeGreaterThan(0);
  });

  it("preserves global-only files and settings in merge mode", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(fixture.target, "agents/global-only.md", "global agent");
    await writeFixtureFile(fixture.target, "skills/global-only/SKILL.md", "global skill");
    await writeFixtureFile(fixture.target, "plugins/global-only.ts", "export default {};");
    await writeFixtureFile(
      fixture.target,
      "opencode.json",
      JSON.stringify({ default_agent: "build", model: "custom/model" }, null, 2),
    );

    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(await readFile(join(fixture.target, "agents/global-only.md"), "utf-8"))
      .toBe("global agent");
    expect(await readFile(join(fixture.target, "skills/global-only/SKILL.md"), "utf-8"))
      .toBe("global skill");
    expect(await readFile(join(fixture.target, "plugins/global-only.ts"), "utf-8"))
      .toBe("export default {};");

    const config = parseJSONC(
      await readFile(join(fixture.target, "opencode.json"), "utf-8"),
    ) as Record<string, unknown>;
    expect(config.default_agent).toBe("build");
    expect(config.model).toBe("custom/model");
    expect(config.instructions).toEqual(["AGENTS.md"]);
    expect(await pathExists(join(fixture.target, "opencode.jsonc"))).toBe(false);
  });

  it("uses OPENCODE_CONFIG as a config source", async () => {
    const fixture = await createFixture();
    const externalPath = await writeFixtureFile(
      fixture.sandbox,
      "external.jsonc",
      JSON.stringify({ model: "custom-env/model" }, null, 2),
    );
    process.env.OPENCODE_CONFIG = externalPath;

    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    const config = await readConfig(fixture.target);
    expect(config.model).toBe("custom-env/model");
    expect(config.instructions).toEqual(["AGENTS.md"]);
  });

  it("creates files in symlink mode with a copy fallback", async () => {
    const fixture = await createFixture();

    await installCommand({
      mode: "symlink",
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(await readFile(join(fixture.target, "agents/orchestrator.md"), "utf-8"))
      .toContain("Fixture orchestrator");
    expect(await readFile(join(fixture.target, "skills/alpha/SKILL.md"), "utf-8"))
      .toContain("Alpha fixture skill");
    expect(await pathExists(join(fixture.target, "opencode.jsonc"))).toBe(true);
    expect(await pathExists(join(fixture.target, "tui.jsonc"))).toBe(true);
  });

  it("accepts copy as a deprecated alias for replace", async () => {
    const fixture = await createFixture();

    const result = await installCommand({
      mode: "copy",
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(result.mode).toBe("replace");
    expect(await pathExists(join(fixture.target, "agents/orchestrator.md"))).toBe(true);
  });

  it("is idempotent on a second merge run", async () => {
    const fixture = await createFixture();
    const first = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    const second = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(second.created).toBe(0);
    expect(second.updated).toBe(0);
    expect(second.kept).toBe(0);
    expect(second.deleted).toBe(0);
    expect(second.unchanged).toBe(first.created);
  });

  it("rejects unknown install modes", async () => {
    const fixture = await createFixture();

    await expect(
      installCommand({
        mode: "deploy" as never,
        source: fixture.repo,
        targetDir: fixture.target,
      }),
    ).rejects.toThrow("Unknown install mode");
  });

  it("rejects remote source URLs", async () => {
    const fixture = await createFixture();

    await expect(
      installCommand({
        source: "github:thomiOmi/agent-skills",
        targetDir: fixture.target,
      }),
    ).rejects.toThrow("Remote source installation is not supported");
  });

  it("describes sources", () => {
    expect(describeSource(undefined)).toContain("local repo");
    expect(describeSource("C:/some/path")).toContain("local path");
  });
});
