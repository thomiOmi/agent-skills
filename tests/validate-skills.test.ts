import { describe, it, expect } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "pathe";

const REPO_ROOT = join(import.meta.dir, "..");
const SKILLS_DIR = join(REPO_ROOT, "skills");
const AGENTS_DIR = join(REPO_ROOT, "agents");
const TOOLS_DIR = join(REPO_ROOT, "tools");

const EXPECTED_SKILLS = [
  "task-decomposition",
  "code-style",
  "api-conventions",
  "testing",
  "documentation",
  "planning",
  "debugging",
  "ai-integration",
  "sdlc-documentation",
  "git-workflow",
  "security-review",
  "database",
  "ui-design",
  "content-strategy",
  "devops-deployment",
];

const EXPECTED_AGENTS = [
  "primary",
  "senior-developer",
  "ui-ux",
  "marketing",
  "qa-engineer",
  "devops",
  "security-auditor",
];

describe("SKILL.md validation", () => {
  it("all skill directories contain a SKILL.md", () => {
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    for (const dir of dirs) {
      const skillFile = join(SKILLS_DIR, dir, "SKILL.md");
      expect(existsSync(skillFile)).toBe(true);
    }
  });

  it("each SKILL.md name field matches its directory name", () => {
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    for (const dir of dirs) {
      const skillFile = join(SKILLS_DIR, dir, "SKILL.md");
      const content = readFileSync(skillFile, "utf-8");
      const match = content.match(/^name:\s*(.+)$/m);
      if (match?.[1]) {
        const name = match[1].trim();
        expect(name).toBe(dir);
      }
    }
  });

  it("each SKILL.md description is non-empty and under 1024 chars", () => {
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    for (const dir of dirs) {
      const skillFile = join(SKILLS_DIR, dir, "SKILL.md");
      const content = readFileSync(skillFile, "utf-8");
      const match = content.match(/^description:\s*(.+)$/m);
      if (match?.[1]) {
        const desc = match[1].trim();
        expect(desc.length).toBeGreaterThan(0);
        expect(desc.length).toBeLessThanOrEqual(1024);
      }
    }
  });

  it(`all ${EXPECTED_SKILLS.length} skills are present`, () => {
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    for (const skill of EXPECTED_SKILLS) {
      expect(dirs).toContain(skill);
    }
  });
});

describe("Agent file validation", () => {
  it(`all ${EXPECTED_AGENTS.length} agent files exist in agents/`, () => {
    const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"));
    const names = files.map((f) => f.replace(/\.md$/, ""));

    for (const agent of EXPECTED_AGENTS) {
      expect(names).toContain(agent);
    }
  });

  it("each agent file has required OpenCode v2 frontmatter", () => {
    const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const content = readFileSync(join(AGENTS_DIR, file), "utf-8");
      expect(content).toMatch(/^---/);
      expect(content).toContain("description:");
      expect(content).toContain("mode:");
    }
  });

  it("no legacy agent files remain", () => {
    const files = readdirSync(AGENTS_DIR);
    expect(files).not.toContain("code-reviewer.md");
    expect(files).not.toContain("laravel-simplifier.md");
    expect(files).not.toContain("orchestrator.md");
  });

});

describe("Custom tools validation", () => {
  it("custom tools directory exists", () => {
    expect(existsSync(TOOLS_DIR)).toBe(true);
  });

  it("task-decomposer tool exists", () => {
    expect(existsSync(join(TOOLS_DIR, "task-decomposer.ts"))).toBe(true);
  });

  it("quality-verifier tool exists", () => {
    expect(existsSync(join(TOOLS_DIR, "quality-verifier.ts"))).toBe(true);
  });

  it("each tool imports from @opencode-ai/plugin", () => {
    const files = readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".ts"));

    for (const file of files) {
      const content = readFileSync(join(TOOLS_DIR, file), "utf-8");
      expect(content).toContain("@opencode-ai/plugin");
    }
  });
});

describe("AGENTS.md validation", () => {
  it("AGENTS.md exists and is non-empty", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md");
    expect(existsSync(agentsPath)).toBe(true);
    const content = readFileSync(agentsPath, "utf-8");
    expect(content.length).toBeGreaterThan(10);
  });

  it("AGENTS.md contains no emoji characters", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md");
    const content = readFileSync(agentsPath, "utf-8");
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(content)).toBe(false);
  });

  it("AGENTS.md has Must do section", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md");
    const content = readFileSync(agentsPath, "utf-8");
    expect(content).toContain("Must do");
  });

  it("AGENTS.md has Must not do section", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md");
    const content = readFileSync(agentsPath, "utf-8");
    expect(content).toContain("Must not do");
  });

  it("AGENTS.md references all 6 agents", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md");
    const content = readFileSync(agentsPath, "utf-8");
    for (const agent of EXPECTED_AGENTS) {
      expect(content).toContain(agent);
    }
  });
});

describe("Config validation", () => {
  it("opencode.jsonc exists", () => {
    expect(existsSync(join(REPO_ROOT, "opencode.jsonc"))).toBe(true);
  });

  it("opencode.jsonc contains agent definitions for all expected agents", () => {
    const config = readFileSync(join(REPO_ROOT, "opencode.jsonc"), "utf-8");
    for (const agent of EXPECTED_AGENTS) {
      expect(config).toContain(`"${agent}"`);
    }
  });
});

describe("src/ removal", () => {
  it("src/ directory no longer exists", () => {
    expect(existsSync(join(REPO_ROOT, "src"))).toBe(false);
  });
});
