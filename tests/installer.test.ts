import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readdir, readFile, stat, writeFile } from "fs/promises";
import { join } from "pathe";
import { tmpdir } from "os";
import { installCommand } from "../src/commands/install";
import { describeSource } from "../src/commands/install";

describe("Installer Commands", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "opencode-installer-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    delete process.env.OPENCODE_CONFIG;
  });

  it("should install files, opencode.jsonc, tui.jsonc, and ~/.agents/skills with copy mode", async () => {
    await installCommand({ mode: "copy", targetDir: tempDir, skipBackup: true });

    const agentsExists = await stat(join(tempDir, "agents")).then(() => true).catch(() => false);
    const skillsExists = await stat(join(tempDir, "skills")).then(() => true).catch(() => false);
    const agentSkillsExists = await stat(join(tempDir, "..", ".agents", "skills")).then(() => true).catch(() => false);
    const toolsExists = await stat(join(tempDir, "tools")).then(() => true).catch(() => false);
    const commandsExists = await stat(join(tempDir, "commands")).then(() => true).catch(() => false);
    const configExists = await stat(join(tempDir, "opencode.jsonc")).then(() => true).catch(() => false);
    const tuiConfigExists = await stat(join(tempDir, "tui.jsonc")).then(() => true).catch(() => false);

    expect(agentsExists).toBe(true);
    expect(skillsExists).toBe(true);
    expect(agentSkillsExists).toBe(true);
    expect(toolsExists).toBe(true);
    expect(commandsExists).toBe(true);
    expect(configExists).toBe(true);
    expect(tuiConfigExists).toBe(true);

    const configContent = await readFile(join(tempDir, "opencode.jsonc"), "utf-8");
    expect(configContent).toContain("plan");
  });

  it("should default to copy mode when no mode is given", async () => {
    await installCommand({ targetDir: tempDir, skipBackup: true });

    const configExists = await stat(join(tempDir, "opencode.jsonc")).then(() => true).catch(() => false);
    expect(configExists).toBe(true);
  });

  it("should detect existing opencode.json or opencode.jsonc and merge settings", async () => {
    const existingOpencodeJson = join(tempDir, "opencode.json");
    await writeFile(existingOpencodeJson, JSON.stringify({
      model: "custom/model-id",
      mcp: { myMcp: { enabled: true } },
    }));

    await installCommand({ mode: "copy", targetDir: tempDir, skipBackup: true });

    const configContent = await readFile(join(tempDir, "opencode.jsonc"), "utf-8");
    expect(configContent).toContain("custom/model-id");
    expect(configContent).toContain("myMcp");
  });

  it("should respect OPENCODE_CONFIG env var for custom config discovery", async () => {
    const customConfigPath = join(tempDir, "custom-opencode.json");
    await writeFile(customConfigPath, JSON.stringify({
      model: "custom-env/model-id",
    }));

    process.env.OPENCODE_CONFIG = customConfigPath;

    await installCommand({ mode: "copy", targetDir: tempDir, skipBackup: true });

    const configContent = await readFile(join(tempDir, "opencode.jsonc"), "utf-8");
    expect(configContent).toContain("custom-env/model-id");
  });

  it("should merge files into target directory with merge mode", async () => {
    await installCommand({ mode: "merge", targetDir: tempDir });

    const agents = await readdir(join(tempDir, "agents"));
    const skills = await readdir(join(tempDir, "skills"));
    const agentSkills = await readdir(join(tempDir, "..", ".agents", "skills"));

    expect(agents.length).toBeGreaterThan(0);
    expect(skills.length).toBeGreaterThan(0);
    expect(agentSkills.length).toBeGreaterThan(0);
  });

  it("should symlink or copy files to target directory with symlink mode", async () => {
    await installCommand({ mode: "symlink", targetDir: tempDir });

    const agentsExists = await stat(join(tempDir, "agents")).then(() => true).catch(() => false);
    const configExists = await stat(join(tempDir, "opencode.jsonc")).then(() => true).catch(() => false);
    const tuiConfigExists = await stat(join(tempDir, "tui.jsonc")).then(() => true).catch(() => false);

    expect(agentsExists).toBe(true);
    expect(configExists).toBe(true);
    expect(tuiConfigExists).toBe(true);
  });

  it("should reject unknown install modes", async () => {
    await installCommand({ mode: "deploy" as never, targetDir: tempDir }).catch((err: Error) => {
      expect(err.message).toContain("Unknown install mode");
    });
  });

  it("should install from a local source path", async () => {
    const repoRoot = join(import.meta.dir, "..");
    await installCommand({ source: repoRoot, mode: "copy", targetDir: tempDir, skipBackup: true });

    const configExists = await stat(join(tempDir, "opencode.jsonc")).then(() => true).catch(() => false);
    const agentsExists = await stat(join(tempDir, "agents")).then(() => true).catch(() => false);
    expect(configExists).toBe(true);
    expect(agentsExists).toBe(true);
  });

  it("should describe sources", () => {
    expect(describeSource(undefined)).toContain("local repo");
    expect(describeSource("github:thomiOmi/agent-skills")).toContain("remote template");
    expect(describeSource("C:/some/path")).toContain("local path");
  });
});
