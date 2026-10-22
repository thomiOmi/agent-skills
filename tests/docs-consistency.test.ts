import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "bun:test";
import { parseJSONC } from "confbox";
import { basename, join } from "pathe";

const repoRoot = join(import.meta.dir, "..");
const agentsDirectory = join(repoRoot, "agents");
const skillsDirectory = join(repoRoot, "skills");
const commandsDirectory = join(repoRoot, "commands");

function readText(path: string): string {
  return readFileSync(path, "utf-8");
}

function parseAgentOrchestra(markdown: string): Map<string, string[]> {
  const start = markdown.indexOf("## Agent Orchestra");
  const end = markdown.indexOf("## Boundaries", start);
  const section = markdown.slice(start, end);
  const roster = new Map<string, string[]>();

  for (const line of section.split(/\r?\n/)) {
    if (!line.startsWith("|")) {
      continue;
    }

    const cells = line.split("|").map(cell => cell.trim());
    const nameMatch = /^`([a-z0-9-]+)`$/.exec(cells[1] ?? "");
    const name = nameMatch?.[1];
    if (!name) {
      continue;
    }

    const skills = (cells[4] ?? "")
      .split(",")
      .map(skill => skill.trim())
      .filter(Boolean);
    roster.set(name, skills);
  }

  return roster;
}

function parseLoadedSkills(agentContent: string): string[] {
  const block = /<skills_to_load>([\s\S]*?)<\/skills_to_load>/.exec(agentContent);
  if (!block) {
    return [];
  }

  return [...(block[1] ?? "").matchAll(/`([a-z0-9-]+)`/g)]
    .map(match => match[1])
    .filter((value): value is string => typeof value === "string");
}

function parseArchitectureRoster(markdown: string): string[] {
  const start = markdown.indexOf("## Agent Roster");
  const end = markdown.indexOf("## Layering", start);
  const section = markdown.slice(start, end);

  return [...section.matchAll(/^\|\s*\*\*([a-z0-9-]+)\*\*\s*\|/gm)]
    .map(match => match[1])
    .filter((value): value is string => typeof value === "string");
}

function parsePrdRoster(markdown: string): string[] {
  const start = markdown.indexOf("### FR-2: Agent Roster");
  const end = markdown.indexOf("### FR-3: Skills", start);
  const section = markdown.slice(start, end);

  return [...section.matchAll(/^\|\s*([a-z0-9-]+)\s*\|\s*subagent\s*\|/gm)]
    .map(match => match[1])
    .filter((value): value is string => typeof value === "string");
}

const agentNames = readdirSync(agentsDirectory)
  .filter(fileName => fileName.endsWith(".md"))
  .map(fileName => basename(fileName, ".md"))
  .sort();
const skillNames = readdirSync(skillsDirectory, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort();
const commandNames = readdirSync(commandsDirectory)
  .filter(fileName => fileName.endsWith(".md"))
  .map(fileName => basename(fileName, ".md"))
  .sort();

describe("Documentation consistency", () => {
  it("keeps the AGENTS.md roster in sync with agent files", () => {
    const roster = parseAgentOrchestra(readText(join(repoRoot, "AGENTS.md")));

    expect(roster.size).toBe(agentNames.length);
    expect([...roster.keys()].sort()).toEqual(agentNames);
  });

  it("keeps the ARCHITECTURE.md roster in sync with agent files", () => {
    const roster = parseArchitectureRoster(readText(join(repoRoot, "ARCHITECTURE.md")));

    expect([...roster].sort()).toEqual(agentNames);
  });

  it("keeps the PRD FR-2 roster in sync with agent files", () => {
    const roster = parsePrdRoster(readText(join(repoRoot, "PRD.md")));

    expect([...roster].sort()).toEqual(agentNames);
  });

  it("keeps agent skills_to_load aligned with AGENTS.md Key Skills", () => {
    const roster = parseAgentOrchestra(readText(join(repoRoot, "AGENTS.md")));

    for (const [agentName, keySkills] of roster) {
      const agentContent = readText(join(agentsDirectory, `${agentName}.md`));
      const loadedSkills = parseLoadedSkills(agentContent);

      expect([...new Set(loadedSkills)].sort()).toEqual([...new Set(keySkills)].sort());

      for (const skill of loadedSkills) {
        expect(skillNames).toContain(skill);
      }
    }
  });

  it("keeps README and PRD counts aligned with the catalog", () => {
    const readme = readText(join(repoRoot, "README.md"));
    const prd = readText(join(repoRoot, "PRD.md"));

    const readmeAgentCount = Number(
      /#\s*(\d+)\s+specialized subagents/.exec(readme)?.[1] ?? -1,
    );
    const readmeCommandCount = Number(
      /#\s*(\d+)\s+slash commands/.exec(readme)?.[1] ?? -1,
    );
    const readmeSkillCount = Number(
      /#\s*(\d+)\s+atomic domain skills/.exec(readme)?.[1] ?? -1,
    );
    const prdSkillCount = Number(
      /The system provides (\d+) skills/.exec(prd)?.[1] ?? -1,
    );

    expect(readmeAgentCount).toBe(agentNames.length);
    expect(readmeCommandCount).toBe(commandNames.length);
    expect(readmeSkillCount).toBe(skillNames.length);
    expect(prdSkillCount).toBe(skillNames.length);
  });

  it("uses experimental.subagent_depth in the shipped config template", () => {
    const config = parseJSONC(
      readText(join(repoRoot, "config/opencode.jsonc")),
    ) as Record<string, unknown>;
    const experimental = config.experimental as Record<string, unknown> | undefined;

    expect(typeof experimental?.subagent_depth).toBe("number");
    expect(config.subagent_depth).toBeUndefined();
    expect(config.small_model).toBeUndefined();
    expect(config.instructions).toEqual(["AGENTS.md"]);
  });
});
