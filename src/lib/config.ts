import { readFile, writeFile, stat } from "fs/promises";
import { join } from "pathe";
import { homedir } from "os";
import { parseJSONC, stringifyJSONC } from "confbox";
import { defu } from "defu";
import { consola } from "consola";
import { getGlobalRoot } from "./paths";

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
  shell: string
  subagent_depth: number
  small_model: string
  permission: Record<string, string>
  instructions: string[]
  mcp?: Record<string, unknown>
  lsp?: unknown
  model?: string
}

export async function buildConfig(opts: MergeConfigOptions): Promise<OpenCodeConfig> {
  const globalRoot = getGlobalRoot();
  const homePosix = homedir().replace(/\\/g, "/");
  const instructionsPath = `${homePosix}/.config/opencode/AGENTS.md`;

  const newCfg: OpenCodeConfig = {
    $schema: "https://opencode.ai/config.json",
    default_agent: "primary",
    shell: "pwsh",
    subagent_depth: 1,
    small_model: "opencode/deepseek-v4-flash-free",
    permission: {
      skill: "allow",
      lsp: "allow",
      question: "allow",
      todowrite: "allow",
      doom_loop: "allow",
    },
    instructions: [instructionsPath],
  };

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

      Object.assign(newCfg, defu(oldSelected, newCfg));
      consola.log(`  merge source: ${mergePath}`);
    }
    catch (err) {
      consola.warn(`could not parse previous config for merge: ${err}`);
    }
  }
  else {
    consola.log("  no previous config to merge — clean template only");
    newCfg.mcp = {};
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
    "// OpenCode global config — deployed from agent-skills",
    opts.backupPath ? `// Backup: ${opts.backupPath}` : "// Backup: (none)",
    `// Deployed: ${new Date().toISOString().replace("T", " ").slice(0, 19)}`,
    "// MCP/LSP merged from previous config when available.",
    "",
  ].join("\n");
  await writeFile(dst, banner + json, "utf-8");
  consola.success("ok  opencode.jsonc");
}
