import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";

export interface InstallerFixture {
  sandbox: string;
  repo: string;
  target: string;
}

export interface ConfigEnvironmentSnapshot {
  restore: () => void;
}

const FIXTURE_FILES: Record<string, string> = {
  "package.json": `${JSON.stringify({ name: "fixture-repo", version: "9.9.9" }, null, 2)}\n`,
  "agents/orchestrator.md": [
    "---",
    "name: orchestrator",
    "description: Fixture orchestrator.",
    "mode: subagent",
    "---",
    "",
    "<role>Fixture orchestrator.</role>",
    "",
  ].join("\n"),
  "agents/qa-engineer.md": [
    "---",
    "name: qa-engineer",
    "description: Fixture QA engineer.",
    "mode: subagent",
    "---",
    "",
    "<role>Fixture QA engineer.</role>",
    "",
  ].join("\n"),
  "skills/alpha/SKILL.md": [
    "---",
    "name: alpha",
    "description: Alpha fixture skill.",
    "---",
    "",
    "# Alpha",
    "",
  ].join("\n"),
  "skills/alpha/references/notes.md": "Alpha reference notes.\n",
  "commands/ship.md": "# Ship\n",
  "plugin/example.ts": "export default { id: \"fixture.example\", setup() {} };\n",
  "instructions/AGENTS.md": "# Fixture Rules\n",
  "config/opencode.jsonc": [
    "{",
    "  \"$schema\": \"https://opencode.ai/config.json\",",
    "  \"default_agent\": \"plan\",",
    "  \"experimental\": {",
    "    \"subagent_depth\": 2",
    "  },",
    "  \"instructions\": [\"AGENTS.md\"],",
    "  \"formatter\": true",
    "}",
    "",
  ].join("\n"),
  "config/tui.jsonc": [
    "{",
    "  \"$schema\": \"https://opencode.ai/tui.json\",",
    "  \"attention\": {",
    "    \"enabled\": true",
    "  }",
    "}",
    "",
  ].join("\n"),
};

/**
 * Creates a minimal repository and an isolated OpenCode target directory.
 *
 * @returns Sandbox, fixture repository, and target paths.
 */
export async function createInstallerFixture(): Promise<InstallerFixture> {
  const sandbox = await mkdtemp(join(tmpdir(), "agent-skills-installer-"));
  const repo = join(sandbox, "repo");
  const target = join(sandbox, "opencode");

  for (const [relativePath, content] of Object.entries(FIXTURE_FILES)) {
    await writeFixtureFile(repo, relativePath, content);
  }

  return { sandbox, repo, target };
}

/**
 * Writes a file inside a fixture root, creating parent directories.
 *
 * @param root Fixture root.
 * @param relativePath Path relative to the root.
 * @param content File content.
 * @returns Absolute file path.
 */
export async function writeFixtureFile(
  root: string,
  relativePath: string,
  content: string,
): Promise<string> {
  const path = join(root, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf-8");
  return path;
}

/**
 * Removes a fixture sandbox and everything inside it.
 *
 * @param fixture Fixture returned by createInstallerFixture.
 */
export async function removeInstallerFixture(fixture: InstallerFixture): Promise<void> {
  await rm(fixture.sandbox, { recursive: true, force: true });
}

/**
 * Clears installer-related environment variables for a deterministic test.
 *
 * @returns Snapshot that restores the previous environment when called.
 */
export function isolateConfigEnvironment(): ConfigEnvironmentSnapshot {
  const openCode = process.env.OPENCODE_CONFIG;
  const tui = process.env.OPENCODE_TUI_CONFIG;

  delete process.env.OPENCODE_CONFIG;
  delete process.env.OPENCODE_TUI_CONFIG;

  return {
    restore: () => {
      if (openCode === undefined) {
        delete process.env.OPENCODE_CONFIG;
      }
      else {
        process.env.OPENCODE_CONFIG = openCode;
      }

      if (tui === undefined) {
        delete process.env.OPENCODE_TUI_CONFIG;
      }
      else {
        process.env.OPENCODE_TUI_CONFIG = tui;
      }
    },
  };
}
