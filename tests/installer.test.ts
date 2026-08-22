import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readdir, readFile, stat, writeFile } from "fs/promises";
import { join } from "pathe";
import { tmpdir } from "os";
import { deployCommand } from "../src/commands/deploy";
import { syncCommand } from "../src/commands/sync";
import { symlinkCommand } from "../src/commands/symlink";

describe("Installer Commands", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "opencode-installer-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should deploy files, opencode.jsonc, tui.jsonc, and ~/.agents/skills to target directory", async () => {
    await deployCommand({ targetDir: tempDir, skipBackup: true });

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
    expect(configContent).toContain("orchestrator");
  });

  it("should detect existing opencode.json or opencode.jsonc and merge settings", async () => {
    const existingOpencodeJson = join(tempDir, "opencode.json");
    await writeFile(existingOpencodeJson, JSON.stringify({
      model: "custom/model-id",
      mcp: { myMcp: { enabled: true } },
    }));

    await deployCommand({ targetDir: tempDir, skipBackup: true });

    const configContent = await readFile(join(tempDir, "opencode.jsonc"), "utf-8");
    expect(configContent).toContain("custom/model-id");
    expect(configContent).toContain("myMcp");
  });

  it("should sync files to target directory", async () => {
    await syncCommand({ targetDir: tempDir });

    const agents = await readdir(join(tempDir, "agents"));
    const skills = await readdir(join(tempDir, "skills"));
    const agentSkills = await readdir(join(tempDir, "..", ".agents", "skills"));

    expect(agents.length).toBeGreaterThan(0);
    expect(skills.length).toBeGreaterThan(0);
    expect(agentSkills.length).toBeGreaterThan(0);
  });

  it("should symlink or copy files to target directory", async () => {
    await symlinkCommand({ targetDir: tempDir });

    const agentsExists = await stat(join(tempDir, "agents")).then(() => true).catch(() => false);
    const configExists = await stat(join(tempDir, "opencode.jsonc")).then(() => true).catch(() => false);
    const tuiConfigExists = await stat(join(tempDir, "tui.jsonc")).then(() => true).catch(() => false);

    expect(agentsExists).toBe(true);
    expect(configExists).toBe(true);
    expect(tuiConfigExists).toBe(true);
  });
});
