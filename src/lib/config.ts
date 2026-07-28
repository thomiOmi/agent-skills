import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { parseJSONC, stringifyJSONC } from "confbox";
import { getGlobalRoot } from "./paths";

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

export function buildConfig(opts: MergeConfigOptions): OpenCodeConfig {
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
  if (!existsSync(mergePath) && opts.backupPath) {
    const candidate = join(opts.backupPath, "opencode.jsonc");
    if (existsSync(candidate)) {
      mergePath = candidate;
    }
  }

  if (existsSync(mergePath)) {
    try {
      const raw = readFileSync(mergePath, "utf-8");
      const old = parseJSONC(raw) as Record<string, unknown>;
      if (typeof old.small_model === "string") {
        newCfg.small_model = old.small_model;
      }
      if (old.lsp !== undefined) {
        newCfg.lsp = old.lsp;
      }
      if (old.mcp !== undefined && typeof old.mcp === "object" && old.mcp !== null) {
        newCfg.mcp = old.mcp as Record<string, unknown>;
        const names = Object.keys(old.mcp).join(", ");
        console.log(`  merged MCP servers: ${names}`);
      }
      if (typeof old.model === "string") {
        newCfg.model = old.model;
      }
      console.log(`  merge source: ${mergePath}`);
    }
    catch (err) {
      console.log(`  warning: could not parse previous config for merge: ${err}`);
    }
  }
  else {
    console.log("  no previous config to merge — clean template only");
    newCfg.mcp = {};
  }

  return newCfg;
}

export function writeConfig(cfg: OpenCodeConfig, opts: MergeConfigOptions): void {
  const dst = join(getGlobalRoot(), "opencode.jsonc");
  if (opts.dryRun) {
    console.log(`  [dry-run] would write ${dst}`);
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
  writeFileSync(dst, banner + json, "utf-8");
  console.log("  ok  opencode.jsonc");
}
