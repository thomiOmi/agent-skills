import type { Manifest, ManifestFile, SourceFile } from "../src/lib/install/types";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "bun:test";
import { createManifest } from "../src/lib/install/manifest";
import { buildInstallPlan } from "../src/lib/install/plan";
import { writeFixtureFile } from "./installer-fixture";

const roots: string[] = [];

async function createConfigRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "agent-skills-plan-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function sourceFile(relativePath: string, content: string): SourceFile {
  return {
    relativePath,
    absolutePath: `/source/${relativePath}`,
    hash: hashContent(content),
    size: Buffer.byteLength(content),
  };
}

function manifest(files: Record<string, ManifestFile>): Manifest {
  const value = createManifest("test");
  value.files = files;
  return value;
}

function manifestFile(hash: string): ManifestFile {
  return {
    hash,
    mode: "copy",
    installedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("Installer plan", () => {
  it("plans create for a missing destination", async () => {
    const configRoot = await createConfigRoot();
    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("skills/alpha/SKILL.md", "new content")],
      manifest: null,
    });

    expect(plan.files).toHaveLength(1);
    expect(plan.files[0]?.action).toBe("create");
    expect(plan.files[0]?.reason).toBe("missing");
    expect(plan.hasChanges).toBe(true);
    expect(plan.warnings).toHaveLength(0);
  });

  it("adopts an existing file when no manifest exists", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "skills/alpha/SKILL.md", "older content");

    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("skills/alpha/SKILL.md", "new content")],
      manifest: null,
    });

    expect(plan.firstRun).toBe(true);
    expect(plan.files[0]?.action).toBe("update");
    expect(plan.files[0]?.reason).toBe("adopted");
    expect(plan.files[0]?.conflict).toBe(false);
    expect(plan.warnings[0]).toContain("No manifest found");
  });

  it("updates a managed file that still matches the manifest hash", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "skills/alpha/SKILL.md", "original");
    const originalHash = hashContent("original");

    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("skills/alpha/SKILL.md", "new content")],
      manifest: manifest({ "skills/alpha/SKILL.md": manifestFile(originalHash) }),
    });

    expect(plan.files[0]?.action).toBe("update");
    expect(plan.files[0]?.reason).toBe("managed-update");
    expect(plan.files[0]?.conflict).toBe(false);
  });

  it("keeps a user-modified managed file in merge mode", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "skills/alpha/SKILL.md", "user edit");

    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("skills/alpha/SKILL.md", "new content")],
      manifest: manifest({ "skills/alpha/SKILL.md": manifestFile(hashContent("original")) }),
    });

    expect(plan.files[0]?.action).toBe("keep");
    expect(plan.files[0]?.reason).toBe("modified");
    expect(plan.files[0]?.conflict).toBe(true);
    expect(plan.hasChanges).toBe(false);
    expect(plan.warnings[0]).toContain("Preserved user-modified file");
  });

  it("overwrites a user-modified managed file in replace mode", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "skills/alpha/SKILL.md", "user edit");

    const plan = await buildInstallPlan({
      mode: "replace",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("skills/alpha/SKILL.md", "new content")],
      manifest: manifest({ "skills/alpha/SKILL.md": manifestFile(hashContent("original")) }),
    });

    expect(plan.files[0]?.action).toBe("update");
    expect(plan.files[0]?.reason).toBe("modified");
    expect(plan.files[0]?.conflict).toBe(false);
  });

  it("deletes a stale managed file that was not modified", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "skills/old/SKILL.md", "stale");

    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("skills/alpha/SKILL.md", "current")],
      manifest: manifest({ "skills/old/SKILL.md": manifestFile(hashContent("stale")) }),
    });

    const stale = plan.files.find(file => file.relativePath === "skills/old/SKILL.md");
    expect(stale?.action).toBe("delete");
    expect(stale?.reason).toBe("stale");
    expect(plan.hasChanges).toBe(true);
  });

  it("keeps a stale managed file that was modified by the user", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "skills/old/SKILL.md", "user edit");

    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [],
      manifest: manifest({ "skills/old/SKILL.md": manifestFile(hashContent("stale")) }),
    });

    const stale = plan.files.find(file => file.relativePath === "skills/old/SKILL.md");
    expect(stale?.action).toBe("keep");
    expect(stale?.reason).toBe("stale-modified");
    expect(stale?.conflict).toBe(false);
    expect(plan.warnings[0]).toContain("Preserved modified file");
  });

  it("reports an unmanaged path as a conflict in replace mode", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "agents/custom.md", "third party");

    const plan = await buildInstallPlan({
      mode: "replace",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("agents/custom.md", "shipped now")],
      manifest: manifest({}),
    });

    expect(plan.files[0]?.action).toBe("keep");
    expect(plan.files[0]?.reason).toBe("unmanaged");
    expect(plan.files[0]?.conflict).toBe(true);
    expect(plan.conflicts).toHaveLength(1);
  });

  it("overwrites an unmanaged path in replace mode when force is set", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "agents/custom.md", "third party");

    const plan = await buildInstallPlan({
      mode: "replace",
      force: true,
      configRoot,
      sourceFiles: [sourceFile("agents/custom.md", "shipped now")],
      manifest: manifest({}),
    });

    expect(plan.files[0]?.action).toBe("update");
    expect(plan.files[0]?.reason).toBe("unmanaged");
    expect(plan.files[0]?.conflict).toBe(true);
  });

  it("preserves unmanaged paths in merge mode", async () => {
    const configRoot = await createConfigRoot();
    await writeFixtureFile(configRoot, "agents/custom.md", "third party");

    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [sourceFile("agents/custom.md", "shipped now")],
      manifest: manifest({}),
    });

    expect(plan.files[0]?.action).toBe("keep");
    expect(plan.hasChanges).toBe(false);
    expect(plan.warnings[0]).toContain("Preserved unmanaged path");
  });

  it("rejects a source path that escapes the config root", async () => {
    const configRoot = await createConfigRoot();

    await expect(
      buildInstallPlan({
        mode: "merge",
        force: false,
        configRoot,
        sourceFiles: [sourceFile("../escape.md", "bad")],
        manifest: null,
      }),
    ).rejects.toThrow("Refusing to write outside");
  });

  it("sorts planned files deterministically", async () => {
    const configRoot = await createConfigRoot();

    const plan = await buildInstallPlan({
      mode: "merge",
      force: false,
      configRoot,
      sourceFiles: [
        sourceFile("skills/zeta/SKILL.md", "z"),
        sourceFile("agents/alpha.md", "a"),
        sourceFile("commands/middle.md", "m"),
      ],
      manifest: null,
    });

    expect(plan.files.map(file => file.relativePath)).toEqual([
      "agents/alpha.md",
      "commands/middle.md",
      "skills/zeta/SKILL.md",
    ]);
  });
});
