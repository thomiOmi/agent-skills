import { readFile, writeFile, stat } from "fs/promises";
import { join } from "pathe";
import { parseJSONC, stringifyJSONC } from "confbox";
import { defu } from "defu";
import { consola } from "consola";
import { getGlobalRoot, repoSubdir } from "./paths";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch {
    return false;
  }
}

export interface MergeConfigOptions {
  dryRun?: boolean
  backupPath?: string | null
}

export interface OpenCodeConfig {
  $schema: string
  default_agent: string
  shell?: string
  subagent_depth: number
  small_model?: string
  model?: string
  permission?: Record<string, unknown>
  instructions?: string[]
  formatter?: unknown
  lsp?: unknown
  watcher?: unknown
  mcp?: Record<string, unknown>
}

export async function buildConfig(opts: MergeConfigOptions): Promise<OpenCodeConfig> {
  const globalRoot = getGlobalRoot();

  // 1. Read template as base
  const templatePath = repoSubdir("config/opencode.jsonc");
  const templateRaw = await readFile(templatePath, "utf-8");
  const template = parseJSONC(templateRaw) as OpenCodeConfig;

  // 2. Apply project overrides
  const newCfg: OpenCodeConfig = {
    ...template,
    $schema: "https://opencode.ai/config.json",
    default_agent: "orchestrator",
    instructions: ["AGENTS.md"],
    small_model: "opencode/deepseek-v4-flash-free",
  };

  // 3. Merge old config (preserves user's existing MCP/LSP/model)
  let mergePath = join(globalRoot, "opencode.jsonc");
  if (!(await exists(mergePath)) && opts.backupPath) {
    const candidate = join(opts.backupPath, "opencode.jsonc");
    if (await exists(candidate)) {
      mergePath = candidate;
    }
  }

  if (await exists(mergePath)) {
    try {
      const raw = await readFile(mergePath, "utf-8");
      const old = parseJSONC(raw) as Record<string, unknown>;

      const oldSelected: Record<string, unknown> = {};
      if (typeof old.small_model === "string") oldSelected.small_model = old.small_model;
      if (old.lsp !== undefined) oldSelected.lsp = old.lsp;
      if (old.mcp !== undefined && typeof old.mcp === "object" && old.mcp !== null) {
        oldSelected.mcp = old.mcp;
        const names = Object.keys(old.mcp).join(", ");
        consola.log(`  merged MCP servers: ${names}`);
      }
      if (typeof old.model === "string") oldSelected.model = old.model;

      // Old config values override template (preserves user's existing setup)
      Object.assign(newCfg, defu(oldSelected, newCfg));
      consola.log(`  merge source: ${mergePath}`);
    }
    catch (err) {
      consola.warn(`could not parse previous config for merge: ${err}`);
    }
  }
  else {
    consola.log("  no previous config to merge - clean template");
  }

  return newCfg;
}

export async function writeConfig(cfg: OpenCodeConfig, opts: MergeConfigOptions): Promise<void> {
  const dst = join(getGlobalRoot(), "opencode.jsonc");
  if (opts.dryRun) {
    consola.log(`  [dry-run] would write ${dst}`);
    return;
  }
  const json = stringifyJSONC(cfg, { space: 2 } as never);
  const banner = [
    "// OpenCode global config - deployed from agent-skills",
    opts.backupPath ? `// Backup: ${opts.backupPath}` : "// Backup: (none)",
    `// Deployed: ${new Date().toISOString().replace("T", " ").slice(0, 19)}`,
    "// MCP/LSP merged from previous config when available.",
    "",
  ].join("\n");
  await writeFile(dst, banner + json, "utf-8");
  consola.success("ok  opencode.jsonc");
}
