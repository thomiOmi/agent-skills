import { readFile, stat, writeFile } from "node:fs/promises";
import process from "node:process";
import { loadConfig } from "c12";
import { parseJSONC, stringifyJSONC } from "confbox";
import { consola } from "consola";
import { defu } from "defu";
import { join, resolve } from "pathe";
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

async function findFirstExisting(paths: string[]): Promise<string | null> {
  for (const p of paths) {
    if (p && (await exists(p))) {
      return p;
    }
  }
  return null;
}

async function readConfigSource(id: string): Promise<unknown> {
  const raw = await readFile(id, "utf-8");
  return parseJSONC(raw) as unknown;
}

function asRecord(value: object): Record<string, unknown> {
  return value as unknown as Record<string, unknown>;
}

export interface MergeConfigOptions {
  dryRun?: boolean;
  backupPath?: string | null;
  targetDir?: string;
  repoRoot?: string;
}

export interface OpenCodeConfig {
  $schema: string;
  default_agent: string;
  shell?: string;
  subagent_depth: number;
  small_model?: string;
  model?: string;
  permission?: Record<string, unknown>;
  instructions?: string[];
  formatter?: unknown;
  lsp?: unknown;
  watcher?: unknown;
  mcp?: Record<string, unknown>;
  provider?: Record<string, unknown>;
  plugin?: string[];
}

export interface OpenCodeTuiConfig {
  $schema?: string;
  theme?: string;
  keybinds?: Record<string, unknown>;
  attention?: Record<string, unknown>;
  cursor?: Record<string, unknown>;
  diff_style?: string;
  scroll_speed?: number;
  [key: string]: unknown;
}

export async function buildConfig(opts: MergeConfigOptions): Promise<OpenCodeConfig> {
  const globalRoot = getGlobalRoot(opts.targetDir);
  const cwd = process.cwd();

  // 1. Read template as base
  const templatePath = join(opts.repoRoot ?? repoSubdir("."), "config/opencode.jsonc");
  const templateRaw = await readFile(templatePath, "utf-8");
  const template = parseJSONC(templateRaw) as OpenCodeConfig;

  // 2. Apply project overrides
  const newCfg: OpenCodeConfig = {
    ...template,
    $schema: "https://opencode.ai/config.json",
    default_agent: "plan",
    instructions: template.instructions ?? ["AGENTS.md"],
    small_model: "opencode/deepseek-v4-flash-free",
  };

  // 3. Search for existing opencode.json or opencode.jsonc in order of precedence:
  //    a) OPENCODE_CONFIG env var (custom file path)
  //    b) Global config dir (opencode.jsonc, opencode.json)
  //    c) Backup path (opencode.jsonc, opencode.json)
  //    d) Current working directory (opencode.jsonc, opencode.json)
  const candidates: (string | undefined)[] = [
    process.env.OPENCODE_CONFIG ? resolve(process.env.OPENCODE_CONFIG) : undefined,
    join(globalRoot, "opencode.jsonc"),
    join(globalRoot, "opencode.json"),
  ];

  if (opts.backupPath) {
    candidates.push(join(opts.backupPath, "opencode.jsonc"));
    candidates.push(join(opts.backupPath, "opencode.json"));
  }

  candidates.push(join(cwd, "opencode.jsonc"));
  candidates.push(join(cwd, "opencode.json"));

  const validCandidates = candidates.filter((c): c is string => Boolean(c));
  const mergePath = await findFirstExisting(validCandidates);

  if (mergePath) {
    try {
      // Load the existing config file via c12 (single explicit file, all
      // advanced sources disabled so behaviour stays deterministic).
      const res = await loadConfig<Record<string, unknown>>({
        name: "opencode",
        cwd,
        configFile: mergePath,
        defaults: asRecord(template),
        packageJson: false,
        rcFile: false,
        dotenv: false,
        envName: false,
        extend: false,
        import: readConfigSource,
      });
      const layer = res.layers?.find(l => l.configFile === mergePath) ?? res.layers?.at(-1);
      const old = (layer?.config ?? res.config ?? null) as Record<string, unknown> | null;

      if (old) {
        const oldSelected: Record<string, unknown> = {};
        if (typeof old.small_model === "string") {
          oldSelected.small_model = old.small_model;
        }
        if (typeof old.model === "string") {
          oldSelected.model = old.model;
        }
        if (typeof old.shell === "string") {
          oldSelected.shell = old.shell;
        }
        if (old.lsp !== undefined) {
          oldSelected.lsp = old.lsp;
        }
        if (old.formatter !== undefined) {
          oldSelected.formatter = old.formatter;
        }
        if (old.provider !== undefined) {
          oldSelected.provider = old.provider;
        }
        if (old.permission !== undefined) {
          oldSelected.permission = old.permission;
        }
        if (Array.isArray(old.plugin)) {
          oldSelected.plugin = old.plugin;
        }
        if (old.mcp !== undefined && typeof old.mcp === "object" && old.mcp !== null) {
          oldSelected.mcp = old.mcp;
          const names = Object.keys(old.mcp).join(", ");
          consola.log(`  merged MCP servers: ${names}`);
        }

        // Old config values override template (preserves user's existing setup)
        Object.assign(newCfg, defu(oldSelected, newCfg));
        consola.log(`  merge source: ${mergePath}`);
      }
      else {
        consola.log("  no config to merge from loaded file - clean template");
      }
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
  const dst = join(getGlobalRoot(opts.targetDir), "opencode.jsonc");
  if (opts.dryRun) {
    consola.log(`  [dry-run] would write ${dst}`);
    return;
  }
  const json = stringifyJSONC(cfg, { space: 2 } as never);
  const banner = [
    "// OpenCode global config - deployed from agent-skills",
    opts.backupPath ? `// Backup: ${opts.backupPath}` : "// Backup: (none)",
    `// Deployed: ${new Date().toISOString().replace("T", " ").slice(0, 19)}`,
    "// Merged from previous config when available.",
    "",
  ].join("\n");
  await writeFile(dst, banner + json, "utf-8");
  consola.success("ok  opencode.jsonc");
}

export async function buildTuiConfig(opts: MergeConfigOptions): Promise<OpenCodeTuiConfig> {
  const globalRoot = getGlobalRoot(opts.targetDir);
  const cwd = process.cwd();

  const templatePath = join(opts.repoRoot ?? repoSubdir("."), "config/tui.jsonc");
  let template: OpenCodeTuiConfig = {
    $schema: "https://opencode.ai/tui.json",
    attention: { enabled: true },
  };

  if (await exists(templatePath)) {
    try {
      const templateRaw = await readFile(templatePath, "utf-8");
      template = parseJSONC(templateRaw) as OpenCodeTuiConfig;
    }
    catch {
      // fallback to default template
    }
  }

  const candidates: (string | undefined)[] = [
    process.env.OPENCODE_TUI_CONFIG ? resolve(process.env.OPENCODE_TUI_CONFIG) : undefined,
    join(globalRoot, "tui.jsonc"),
    join(globalRoot, "tui.json"),
  ];

  if (opts.backupPath) {
    candidates.push(join(opts.backupPath, "tui.jsonc"));
    candidates.push(join(opts.backupPath, "tui.json"));
  }

  candidates.push(join(cwd, "tui.jsonc"));
  candidates.push(join(cwd, "tui.json"));

  const validCandidates = candidates.filter((c): c is string => Boolean(c));
  const mergePath = await findFirstExisting(validCandidates);

  if (mergePath) {
    try {
      // Load the existing TUI config file via c12 with the template as defaults.
      const res = await loadConfig<Record<string, unknown>>({
        name: "tui",
        cwd,
        configFile: mergePath,
        defaults: asRecord(template),
        packageJson: false,
        rcFile: false,
        dotenv: false,
        envName: false,
        extend: false,
        import: readConfigSource,
      });
      const layer = res.layers?.find(l => l.configFile === mergePath) ?? res.layers?.at(-1);
      const old = (layer?.config ?? res.config ?? null) as OpenCodeTuiConfig | null;
      if (old) {
        return defu(old, template);
      }
    }
    catch (err) {
      consola.warn(`could not parse previous TUI config for merge: ${err}`);
    }
  }

  return template;
}

export async function writeTuiConfig(cfg: OpenCodeTuiConfig, opts: MergeConfigOptions): Promise<void> {
  const dst = join(getGlobalRoot(opts.targetDir), "tui.jsonc");
  if (opts.dryRun) {
    consola.log(`  [dry-run] would write ${dst}`);
    return;
  }
  const json = stringifyJSONC(cfg, { space: 2 } as never);
  const banner = [
    "// OpenCode global TUI config - deployed from agent-skills",
    `// Deployed: ${new Date().toISOString().replace("T", " ").slice(0, 19)}`,
    "",
  ].join("\n");
  await writeFile(dst, banner + json, "utf-8");
  consola.success("ok  tui.jsonc");
}
