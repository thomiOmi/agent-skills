import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "bun:test";
import { basename, join } from "pathe";

interface PermissionEntry {
  action?: unknown;
  resource?: unknown;
  effect?: unknown;
}

interface AgentFrontmatter {
  name?: unknown;
  mode?: unknown;
  permissions?: unknown;
  permission?: unknown;
  bash?: unknown;
  task?: unknown;
  tools?: unknown;
  temperature?: unknown;
  request?: {
    body?: {
      temperature?: unknown;
    };
  };
}

interface ParsedAgent {
  fileName: string;
  frontmatter: AgentFrontmatter;
  permissions: PermissionEntry[];
}

const agentsDirectory = join(import.meta.dir, "..", "agents");
const agentFiles = readdirSync(agentsDirectory)
  .filter(fileName => fileName.endsWith(".md"))
  .sort();

function parseAgent(fileName: string): ParsedAgent {
  const content = readFileSync(join(agentsDirectory, fileName), "utf-8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (!match) {
    throw new Error(`Missing frontmatter: ${fileName}`);
  }

  const frontmatter = Bun.YAML.parse(match[1] ?? "") as AgentFrontmatter;
  const permissions = Array.isArray(frontmatter.permissions)
    ? frontmatter.permissions as PermissionEntry[]
    : [];

  return { fileName, frontmatter, permissions };
}

const agents = agentFiles.map(parseAgent);

describe("Agent permissions", () => {
  it("declares a V2 permissions array for every agent", () => {
    expect(agents.length).toBeGreaterThan(0);

    for (const agent of agents) {
      expect(Array.isArray(agent.frontmatter.permissions)).toBe(true);
      expect(agent.permissions.length).toBeGreaterThan(0);
    }
  });

  it("does not use legacy permission keys", () => {
    for (const agent of agents) {
      expect(agent.frontmatter.permission).toBeUndefined();
      expect(agent.frontmatter.bash).toBeUndefined();
      expect(agent.frontmatter.task).toBeUndefined();
      expect(agent.frontmatter.tools).toBeUndefined();
      expect(agent.frontmatter.temperature).toBeUndefined();
    }
  });

  it("uses valid permission entries", () => {
    for (const agent of agents) {
      for (const permission of agent.permissions) {
        expect(typeof permission.action).toBe("string");
        expect(typeof permission.resource).toBe("string");
        expect(["allow", "ask", "deny"]).toContain(permission.effect as string);
      }
    }
  });

  it("grants read access to every agent", () => {
    for (const agent of agents) {
      const readAllowed = agent.permissions.some(
        permission => permission.action === "read"
          && permission.resource === "*"
          && permission.effect === "allow",
      );
      expect(readAllowed).toBe(true);
    }
  });

  it("keeps agent names and modes consistent", () => {
    for (const agent of agents) {
      expect(agent.frontmatter.name).toBe(basename(agent.fileName, ".md"));
      expect(agent.frontmatter.mode).toBe("subagent");
    }
  });

  it("lets the orchestrator delegate but not to itself", () => {
    const orchestrator = agents.find(agent => agent.fileName === "orchestrator.md");
    expect(orchestrator).toBeDefined();

    const canDelegate = orchestrator?.permissions.some(
      permission => permission.action === "subagent"
        && permission.resource === "*"
        && permission.effect === "allow",
    );
    const cannotSelfDelegate = orchestrator?.permissions.some(
      permission => permission.action === "subagent"
        && permission.resource === "orchestrator"
        && permission.effect === "deny",
    );

    expect(canDelegate).toBe(true);
    expect(cannotSelfDelegate).toBe(true);
  });

  it("keeps temperature under request.body", () => {
    for (const agent of agents) {
      const temperature = agent.frontmatter.request?.body?.temperature;
      if (temperature !== undefined) {
        expect(typeof temperature).toBe("number");
        expect(temperature as number).toBeGreaterThanOrEqual(0);
        expect(temperature as number).toBeLessThanOrEqual(2);
      }
    }
  });

  it("does not hardcode language-specific test commands in permissions", () => {
    for (const agent of agents) {
      for (const permission of agent.permissions) {
        const resource = String(permission.resource);
        expect(resource).not.toContain("bun test");
        expect(resource).not.toContain("npm test");
      }
    }
  });
});
