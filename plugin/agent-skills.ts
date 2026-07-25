import { consola } from "consola";
import { join, relative } from "pathe";
import { homedir } from "os";
import { readdir, mkdir, rm, copyFile, exists, readFile, writeFile } from "fs/promises";
import type { Plugin } from "@opencode-ai/plugin";
import { hash } from "ohash";

const SERVICE_NAME = "agent-skills";
const REMOTE_AGENTS_MD_URL = "https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md";

const RECOMMENDED_MCP_SERVERS = [
  {
    name: "github",
    command: "npx",
    args: ["@modelcontextprotocol/server-github"],
    environment: { GITHUB_TOKEN: "your_token_here" },
  },
  {
    name: "context7",
    command: "npx",
    args: ["@upstash/context7"],
  },
  {
    name: "grep",
    command: "npx",
    args: ["grep"],
  },
];

export const AgentSkillsPlugin: Plugin = async () => {
  consola.info(`[${SERVICE_NAME}] Plugin initialized`);

  return {
    event: async ({ event }) => {
      if (event.type === "installation.updated") {
        consola.info(`[${SERVICE_NAME}] Installation updated, syncing skills...`);
        await runInstall();
      }

      if (event.type === "session.created") {
        consola.debug(`[${SERVICE_NAME}] Session created, checking skills sync...`);
        await runInstall();
      }
    },
  };
};

async function runInstall(): Promise<void> {
  const home = homedir();
  const configDir = join(home, ".config", "opencode");
  const skillsDir = join(configDir, "skills");
  const configPath = join(configDir, "opencode.jsonc");

  try {
    await configureConfig(configPath);
    await syncSkills(skillsDir);
  } catch (error) {
    consola.error(`[${SERVICE_NAME}] Install failed: ${String(error)}`);
  }
}

async function configureConfig(configPath: string): Promise<void> {
  try {
    if (!(await exists(configPath))) return;

    const content = await readFile(configPath, "utf-8");
    const config = parseJsonc(content);

    const instructions = (config.instructions ?? []) as string[];
    if (!instructions.includes(REMOTE_AGENTS_MD_URL)) {
      instructions.push(REMOTE_AGENTS_MD_URL);
      consola.info(`[${SERVICE_NAME}] Added instructions to config`);
    }

    const permissions = (config.permissions ?? []) as Array<{
      action?: string;
      resource?: string;
      effect?: string;
    }>;
    const hasSkillAllow = permissions.some((p) => p.action === "skill" && p.resource === "*" && p.effect === "allow");
    if (!hasSkillAllow) {
      permissions.push({ action: "skill", resource: "*", effect: "allow" });
      consola.info(`[${SERVICE_NAME}] Added skill permissions to config`);
    }

    const mcpTop = (config.mcp ?? {}) as Record<string, unknown>;
    const servers = (mcpTop.servers ?? {}) as Record<string, Record<string, unknown>>;
    for (const server of RECOMMENDED_MCP_SERVERS) {
      if (!servers[server.name]) {
        servers[server.name] = {
          type: "local",
          command: server.command,
          args: server.args,
        };
        if (server.environment) {
          servers[server.name]!.environment = server.environment;
        }
        consola.info(`[${SERVICE_NAME}] Added MCP server: ${server.name}`);
      }
    }

    const output = JSON.stringify({ ...config, instructions, permissions, mcp: { servers } }, null, 2);
    await writeFile(configPath, output + "\n", "utf-8");
  } catch (error) {
    consola.warn(`[${SERVICE_NAME}] Could not update config: ${String(error)}`);
  }
}

async function syncSkills(targetDir: string): Promise<void> {
  await mkdir(targetDir, { recursive: true });

  const sourceDir = join(import.meta.dir, "..", "skills");
  if (!(await exists(sourceDir))) return;

  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillName = entry.name;
    const sourceSkillDir = join(sourceDir, skillName);
    const targetSkillDir = join(targetDir, skillName);
    const hashFilePath = join(targetSkillDir, ".agent-skills-hash");

    try {
      const sourceHash = await hashDirectory(sourceSkillDir);
      let targetHash = null;
      if (await exists(hashFilePath)) {
        targetHash = await readFile(hashFilePath, "utf-8");
      }

      if (sourceHash === targetHash) {
        consola.info(`[${SERVICE_NAME}] Skill ${skillName} is up to date, skipping`);
        continue;
      }

      // Remove target directory and copy fresh
      await rm(targetSkillDir, { recursive: true, force: true });
      await copyDir(sourceSkillDir, targetSkillDir);
      await writeFile(hashFilePath, sourceHash, "utf-8");
      consola.info(`[${SERVICE_NAME}] Installed/updated skill: ${skillName}`);
    } catch (error) {
      consola.error(`[${SERVICE_NAME}] Failed to process skill ${skillName}: ${String(error)}`);
    }
  }
}

async function hashDirectory(dir: string): Promise<string> {
  const files: { relativePath: string; content: string }[] = [];
  const stack = [dir];
  while (stack.length) {
    const currentDir = stack.pop()!;
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name !== ".agent-skills-hash") {
        const relativePath = relative(dir, fullPath);
        const content = await readFile(fullPath, "utf-8");
        files.push({ relativePath, content });
      }
    }
  }
  // Sort by relativePath to ensure consistent hash
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  // Create a deterministic string to hash
  const hashInput = files.map((f) => `${f.relativePath}\0${f.content}`).join("\0");
  return hash(hashInput);
}

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

function parseJsonc(content: string): Record<string, unknown> {
  let json = content;
  json = json.replace(/\/\/.*$/gm, "");
  json = json.replace(/\/\*[\s\S]*?\*\//g, "");
  json = json.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(json);
}
