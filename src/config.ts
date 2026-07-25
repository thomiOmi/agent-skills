import { defu } from "defu";
import { consola } from "consola";
import { readFile, writeFile, exists } from "fs/promises";
import type { OpenCodeConfig, McpServerConfig, McpServerPackage } from "./types";

export async function readOpenCodeConfig(configPath: string): Promise<OpenCodeConfig | null> {
  try {
    if (!(await exists(configPath))) {
      return null;
    }
    const content = await readFile(configPath, "utf-8");
    const parsed = parseJsonc(content);
    return parsed as OpenCodeConfig;
  } catch (error) {
    consola.warn(`Failed to read config at ${configPath}: ${String(error)}`);
    return null;
  }
}

export async function writeOpenCodeConfig(configPath: string, config: OpenCodeConfig): Promise<boolean> {
  try {
    const existing = await readOpenCodeConfig(configPath);
    const merged = defu(existing, config) as OpenCodeConfig;
    const serialized = serializeJsonc(merged);
    await writeFile(configPath, serialized, "utf-8");
    consola.info(`Updated config at ${configPath}`);
    return true;
  } catch (error) {
    consola.error(`Failed to write config at ${configPath}: ${String(error)}`);
    return false;
  }
}

export async function ensureInstructions(configPath: string, instructions: string[]): Promise<boolean> {
  const config = await readOpenCodeConfig(configPath);
  if (!config) {
    return false;
  }

  const existing = config.instructions ?? [];
  const newInstructions = instructions.filter((inst) => !existing.includes(inst));

  if (newInstructions.length === 0) {
    consola.info("Instructions already present in config");
    return true;
  }

  const updated = { ...config, instructions: [...existing, ...newInstructions] };
  return writeOpenCodeConfig(configPath, updated);
}

export async function ensurePermissions(configPath: string, permissions: Record<string, string>): Promise<boolean> {
  const config = await readOpenCodeConfig(configPath);
  if (!config) {
    return false;
  }

  const existing = config.permission?.skill ?? {};
  const hasChanges = Object.entries(permissions).some(([key, value]) => existing[key] !== value);

  if (!hasChanges) {
    consola.info("Permissions already configured");
    return true;
  }

  const updated = {
    ...config,
    permission: {
      ...config.permission,
      skill: { ...existing, ...permissions },
    },
  };
  return writeOpenCodeConfig(configPath, updated);
}

export async function ensureMcpServers(configPath: string, servers: McpServerPackage[]): Promise<boolean> {
  const config = await readOpenCodeConfig(configPath);
  if (!config) {
    return false;
  }

  const existing = config.mcp ?? {};
  let changed = false;
  const updatedMcp: Record<string, McpServerConfig> = { ...existing };

  for (const server of servers) {
    if (!existing[server.name]) {
      updatedMcp[server.name] = {
        type: "local",
        command: server.config.command,
        args: server.config.args,
        env: server.config.env,
      };
      changed = true;
      consola.info(`Added MCP server: ${server.name}`);
    }
  }

  if (!changed) {
    consola.info("All MCP servers already configured");
    return true;
  }

  const updated = { ...config, mcp: updatedMcp };
  return writeOpenCodeConfig(configPath, updated);
}

export async function hasOpenCodeConfig(configPath: string): Promise<boolean> {
  return exists(configPath);
}

function parseJsonc(content: string): Record<string, unknown> {
  let json = content;
  json = json.replace(/\/\/.*$/gm, "");
  json = json.replace(/\/\*[\s\S]*?\*\//g, "");
  json = json.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(json);
}

function serializeJsonc(config: OpenCodeConfig): string {
  const entries = Object.entries(config)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const serialized = typeof value === "string" ? value : JSON.stringify(value, null, 2);
      return `  "${key}": ${serialized}`;
    });
  return `{\n${entries.join(",\n")}\n}\n`;
}
