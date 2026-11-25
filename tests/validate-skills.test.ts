import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import opencodeFrontmatter, { COMPATIBILITY_MAX, DESCRIPTION_MAX, SKILL_NAME_MAX } from "../scripts/opencode-frontmatter.js";

interface SkillFrontmatter {
  name: string;
  description: string;
  compatibility?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SkillDocument {
  body: string;
  frontmatter: SkillFrontmatter;
  refs: string[];
}

interface RuleReport {
  messageId?: string;
  data?: Record<string, unknown>;
}

interface RuleContext {
  filename: string;
  sourceCode: { getText: () => string; text: string };
  options: unknown[];
  report: (descriptor: RuleReport) => void;
}

interface FrontmatterRule {
  create: (context: RuleContext) => { Program?: (node: object) => void };
}

const skillsDir = join(import.meta.dir, "..", "skills");
const nameRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedFrontmatterKeys = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);

async function discoverSkillNames(): Promise<string[]> {
  const entries = await readdir(skillsDir);
  const names: string[] = [];
  for (const entry of entries) {
    const info = await stat(join(skillsDir, entry)).catch(() => undefined);
    if (info?.isDirectory()) {
      names.push(entry);
    }
  }
  return names.sort();
}

const skillNames = await discoverSkillNames();

async function loadSkill(name: string): Promise<SkillDocument> {
  const skillDirPath = join(skillsDir, name);
  const skillFilePath = join(skillDirPath, "SKILL.md");
  const exists = await stat(skillFilePath).then(() => true).catch(() => false);
  expect(exists, `${name}: SKILL.md is missing`).toBe(true);
  const content = await readFile(skillFilePath, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  expect(match, `${name}: missing YAML frontmatter`).not.toBeNull();
  const frontmatter = Bun.YAML.parse(match?.[1] ?? "") as SkillFrontmatter;
  expect(frontmatter, `${name}: empty YAML frontmatter`).toBeDefined();
  const refs = [...content.matchAll(/`((?:references|assets)\/[\w.-]+\.md)`/g)].map(found => found[1] ?? "");
  return { body: content.slice(match?.[0].length ?? 0), frontmatter, refs };
}

const rules = opencodeFrontmatter.rules as unknown as Record<string, FrontmatterRule>;

/** Runs a frontmatter rule with a minimal ESLint context and returns its reports. */
function lintFrontmatter(ruleName: string, frontmatterText: string, filename: string): RuleReport[] {
  const rule = rules[ruleName];
  expect(rule, `unknown frontmatter rule '${ruleName}'`).toBeDefined();
  if (!rule) {
    return [];
  }
  const reports: RuleReport[] = [];
  const text = `---\n${frontmatterText}\n---\n\nbody\n`;
  const listeners = rule.create({
    filename,
    sourceCode: { getText: () => text, text },
    options: [],
    report: descriptor => reports.push(descriptor),
  });
  listeners.Program?.({});
  return reports;
}

const V2_AGENT = `
name: synthetic-agent
description: A synthetic agent used to validate V2 frontmatter.
mode: subagent
color: "#ec4899"
request:
  body:
    temperature: 1.5
permissions:
  - action: read
    resource: "*"
    effect: allow
  - action: subagent
    resource: "self"
    effect: deny
`;

describe("Validate Skills (Agent Skills Specification)", () => {
  it("discovers a non-empty skill catalog", () => {
    expect(skillNames.length, "skill catalog is empty").toBeGreaterThan(0);
  });

  for (const name of skillNames) {
    it(`validates skill '${name}' against the Agent Skills specification`, async () => {
      const { body, frontmatter, refs } = await loadSkill(name);
      const skillDirPath = join(skillsDir, name);

      for (const key of Object.keys(frontmatter)) {
        expect(allowedFrontmatterKeys.has(key), `${name}: unsupported frontmatter key '${key}'`).toBe(true);
      }

      expect(typeof frontmatter.name, `${name}: name must be a string`).toBe("string");
      if (typeof frontmatter.name !== "string") {
        return;
      }
      expect(frontmatter.name, `${name}: name must match its directory`).toBe(name);
      expect(frontmatter.name.length, `${name}: name must not be empty`).toBeGreaterThanOrEqual(1);
      expect(frontmatter.name.length, `${name}: name exceeds ${SKILL_NAME_MAX} characters`).toBeLessThanOrEqual(SKILL_NAME_MAX);
      expect(nameRegex.test(frontmatter.name), `${name}: name has an invalid format`).toBe(true);

      expect(typeof frontmatter.description, `${name}: description must be a string`).toBe("string");
      if (typeof frontmatter.description !== "string") {
        return;
      }
      expect(frontmatter.description.length, `${name}: description must not be empty`).toBeGreaterThanOrEqual(1);
      expect(frontmatter.description.length, `${name}: description exceeds ${DESCRIPTION_MAX} characters`).toBeLessThanOrEqual(DESCRIPTION_MAX);

      if (frontmatter.compatibility !== undefined) {
        expect(typeof frontmatter.compatibility, `${name}: compatibility must be a string`).toBe("string");
        expect(frontmatter.compatibility.length, `${name}: compatibility exceeds ${COMPATIBILITY_MAX} characters`)
          .toBeLessThanOrEqual(COMPATIBILITY_MAX);
      }

      if (frontmatter.metadata !== undefined) {
        expect(typeof frontmatter.metadata, `${name}: metadata must be an object`).toBe("object");
        expect(frontmatter.metadata, `${name}: metadata must not be null`).not.toBeNull();
        for (const [key, value] of Object.entries(frontmatter.metadata ?? {})) {
          if (key === "opencode/autoinvoke" && typeof value === "boolean") {
            continue;
          }
          expect(typeof value, `${name}: metadata.${key} must be a string`).toBe("string");
        }
      }

      expect(body.split("\n").length, `${name}: SKILL.md body exceeds 500 lines`).toBeLessThanOrEqual(500);

      for (const ref of refs) {
        const refPath = join(skillDirPath, ref);
        const refExists = await stat(refPath).then(() => true).catch(() => false);
        expect(refExists, `${name}: referenced file '${ref}' is missing`).toBe(true);
      }
    });
  }

  it("keeps every catalog skill available to agents", async () => {
    for (const name of skillNames) {
      const { frontmatter } = await loadSkill(name);
      expect(
        frontmatter.metadata?.["opencode/autoinvoke"],
        `${name}: autoinvoke false hides the skill from agents that load it by ID`,
      ).toBeUndefined();
    }
  });

  it("contains at least one internal reference across the catalog", async () => {
    let totalRefCount = 0;
    for (const name of skillNames) {
      const { refs } = await loadSkill(name);
      totalRefCount += refs.length;
    }
    expect(totalRefCount, "no references/*.md links found").toBeGreaterThan(0);
  });
});

describe("Frontmatter specification constants", () => {
  it("shares one set of limits with the ESLint frontmatter rules", () => {
    expect(SKILL_NAME_MAX).toBe(64);
    expect(DESCRIPTION_MAX).toBe(1024);
    expect(COMPATIBILITY_MAX).toBe(500);
  });

  it("treats the description maximum as a hard failure", () => {
    const atLimit = lintFrontmatter(
      "description-length",
      `name: synthetic\ndescription: ${"x".repeat(DESCRIPTION_MAX)}`,
      "/repo/skills/synthetic/SKILL.md",
    );
    expect(atLimit, "a description at the shared limit must pass").toEqual([]);
    const overLimit = lintFrontmatter(
      "description-length",
      `name: synthetic\ndescription: ${"x".repeat(DESCRIPTION_MAX + 1)}`,
      "/repo/skills/synthetic/SKILL.md",
    );
    expect(overLimit.length, "a description over the shared limit must be reported").toBe(1);
  });
});

describe("V2 agent frontmatter rule", () => {
  it("accepts permissions entries and request.body.temperature within 0..2", () => {
    const reports = lintFrontmatter("valid-agent-frontmatter", V2_AGENT, "/repo/agents/synthetic-agent.md");
    expect(reports, JSON.stringify(reports)).toEqual([]);
  });

  it("rejects an invalid permission effect", () => {
    const text = V2_AGENT.replace("effect: deny", "effect: maybe");
    const reports = lintFrontmatter("valid-agent-frontmatter", text, "/repo/agents/synthetic-agent.md");
    expect(reports.map(report => report.messageId)).toContain("invalidPermissionEffect");
  });

  it("rejects a malformed permissions array", () => {
    const text = V2_AGENT.replace(/permissions:[\s\S]*$/, "permissions: not-an-array\n");
    const reports = lintFrontmatter("valid-agent-frontmatter", text, "/repo/agents/synthetic-agent.md");
    expect(reports.map(report => report.messageId)).toContain("invalidPermissionsShape");
  });

  it("rejects temperature above 2 under request.body", () => {
    const text = V2_AGENT.replace("temperature: 1.5", "temperature: 2.5");
    const reports = lintFrontmatter("valid-agent-frontmatter", text, "/repo/agents/synthetic-agent.md");
    expect(reports.map(report => report.messageId)).toContain("temperatureOutOfRange");
  });

  it("reports deprecated V1 keys instead of silently accepting them", () => {
    const legacy = `
name: synthetic-agent
description: A synthetic agent using the obsolete V1 permission schema.
mode: subagent
temperature: 0.2
permission:
  "*": allow
bash:
  "*": ask
task:
  "*": deny
tools:
  edit: false
`;
    const reports = lintFrontmatter("deprecated-agent-frontmatter", legacy, "/repo/agents/synthetic-agent.md");
    expect(reports.map(report => report.data?.field)).toEqual([
      "permission",
      "bash",
      "task",
      "tools",
      "temperature",
    ]);
  });
});
