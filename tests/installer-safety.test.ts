import type { ConfigEnvironmentSnapshot, InstallerFixture } from "./installer-fixture";
import { readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { parseJSONC } from "confbox";
import { installCommand } from "../src/commands/install";
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

describe("Installer safety", () => {
  it("preserves third-party files in merge mode", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    const thirdParty = {
      "agents/custom.md": "custom agent",
      "skills/third-party/SKILL.md": "custom skill",
      "commands/custom.md": "custom command",
      "plugins/custom.ts": "export default {};",
    };
    for (const [relativePath, content] of Object.entries(thirdParty)) {
      await writeFixtureFile(fixture.target, relativePath, content);
    }

    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    for (const [relativePath, content] of Object.entries(thirdParty)) {
      expect(await readFile(join(fixture.target, relativePath), "utf-8")).toBe(content);
    }
  });

  it("preserves a modified managed file in merge mode", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    await writeFixtureFile(fixture.target, "skills/alpha/SKILL.md", "user edit");

    const result = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(await readFile(join(fixture.target, "skills/alpha/SKILL.md"), "utf-8"))
      .toBe("user edit");
    expect(result.kept).toBe(1);
    expect(result.conflicts).toContain("skills/alpha/SKILL.md");
  });

  it("deletes a stale managed file that was not modified", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    await rm(join(fixture.repo, "skills/alpha/references/notes.md"));

    const result = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(await pathExists(join(fixture.target, "skills/alpha/references/notes.md")))
      .toBe(false);
    expect(result.deleted).toBe(1);
  });

  it("keeps a stale managed file that was modified", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    await writeFixtureFile(fixture.target, "skills/alpha/references/notes.md", "user edit");
    await rm(join(fixture.repo, "skills/alpha/references/notes.md"));

    const result = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(await readFile(join(fixture.target, "skills/alpha/references/notes.md"), "utf-8"))
      .toBe("user edit");
    expect(result.kept).toBe(1);
  });

  it("keeps an unmanaged file at a newly shipped path in merge mode", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    await writeFixtureFile(fixture.repo, "agents/custom.md", "shipped now");
    await writeFixtureFile(fixture.target, "agents/custom.md", "third party");

    const result = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(await readFile(join(fixture.target, "agents/custom.md"), "utf-8"))
      .toBe("third party");
    expect(result.kept).toBe(1);
    expect(result.conflicts).toContain("agents/custom.md");
  });

  it("aborts replace mode without force before writing anything", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    const installedOrchestrator = await readFile(
      join(fixture.target, "agents/orchestrator.md"),
      "utf-8",
    );
    await writeFixtureFile(fixture.repo, "agents/orchestrator.md", "new source content");
    await writeFixtureFile(fixture.repo, "agents/custom.md", "shipped now");
    await writeFixtureFile(fixture.target, "agents/custom.md", "third party");

    await expect(
      installCommand({
        mode: "replace",
        source: fixture.repo,
        targetDir: fixture.target,
        skipBackup: true,
      }),
    ).rejects.toThrow("does not own");

    expect(await readFile(join(fixture.target, "agents/orchestrator.md"), "utf-8"))
      .toBe(installedOrchestrator);
    expect(await readFile(join(fixture.target, "agents/custom.md"), "utf-8"))
      .toBe("third party");
  });

  it("overwrites unmanaged paths in replace mode with force and backs up first", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    await writeFixtureFile(fixture.repo, "agents/custom.md", "shipped now");
    await writeFixtureFile(fixture.target, "agents/custom.md", "third party");
    const backupRoot = join(fixture.sandbox, "backups");

    const result = await installCommand({
      mode: "replace",
      force: true,
      source: fixture.repo,
      targetDir: fixture.target,
      backupPath: backupRoot,
    });

    expect(await readFile(join(fixture.target, "agents/custom.md"), "utf-8"))
      .toBe("shipped now");
    expect(result.backupPath).not.toBeNull();

    const backupEntries = await readdir(backupRoot);
    expect(backupEntries).toHaveLength(1);
    const backupDirectory = join(backupRoot, backupEntries[0] as string);
    expect(await readFile(join(backupDirectory, "agents/custom.md"), "utf-8"))
      .toBe("third party");
    expect(await pathExists(join(backupDirectory, "BACKUP.md"))).toBe(true);
  });

  it("aborts on an invalid config before writing anything", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(fixture.target, "opencode.jsonc", "{ \"default_agent\": }");

    await expect(
      installCommand({
        source: fixture.repo,
        targetDir: fixture.target,
        skipBackup: true,
      }),
    ).rejects.toThrow("Could not parse");

    expect(await pathExists(join(fixture.target, "agents/orchestrator.md"))).toBe(false);
    expect(await pathExists(join(fixture.target, ".agent-skills-manifest.json"))).toBe(false);
  });

  it("replaces an invalid config when force is set", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(fixture.target, "opencode.jsonc", "{ \"default_agent\": }");

    const result = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
      force: true,
    });

    expect(result.created).toBeGreaterThan(0);
    expect(await pathExists(join(fixture.target, "agents/orchestrator.md"))).toBe(true);

    const config = parseJSONC(
      await readFile(join(fixture.target, "opencode.jsonc"), "utf-8"),
    ) as Record<string, unknown>;
    expect(config.default_agent).toBe("plan");
  });

  it("aborts on a corrupt manifest unless force is set", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(fixture.target, ".agent-skills-manifest.json", "{ not json");

    await expect(
      installCommand({
        source: fixture.repo,
        targetDir: fixture.target,
        skipBackup: true,
      }),
    ).rejects.toThrow("Manifest");

    expect(await pathExists(join(fixture.target, "agents/orchestrator.md"))).toBe(false);

    const result = await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
      force: true,
    });

    expect(result.created).toBeGreaterThan(0);
    expect(await pathExists(join(fixture.target, "agents/orchestrator.md"))).toBe(true);
  });

  it("does not create a sibling .agents directory", async () => {
    const fixture = await createFixture();
    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      skipBackup: true,
    });

    expect(await pathExists(join(fixture.sandbox, ".agents"))).toBe(false);
  });

  it("writes nothing during a dry run", async () => {
    const fixture = await createFixture();

    await installCommand({
      source: fixture.repo,
      targetDir: fixture.target,
      dryRun: true,
      skipBackup: true,
    });

    expect(await pathExists(fixture.target)).toBe(false);
  });
});
