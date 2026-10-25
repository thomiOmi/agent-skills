import { readFile } from "node:fs/promises";
import process from "node:process";
import { parseJSONC, stringifyJSONC } from "confbox";
import { consola } from "consola";
import { join, resolve } from "pathe";
import { deepEqual, isPlainRecord, pathExists, writeFileAtomic } from "./utils";

export interface OpenCodeConfig {
  [key: string]: unknown;
  $schema?: string;
  default_agent?: string;
  instructions?: string[];
  experimental?: Record<string, unknown>;
}

export interface OpenCodeTuiConfig {
  [key: string]: unknown;
}

export interface PreparedConfig<T> {
  path: string;
  value: T;
  changed: boolean;
  warnings: string[];
}

export interface PreparedConfigs {
  openCode: PreparedConfig<OpenCodeConfig>;
  tui: PreparedConfig<OpenCodeTuiConfig>;
}

interface ConfigSource {
  path: string;
  raw: string;
  value: Record<string, unknown>;
}

/** Raised when an existing configuration file cannot be parsed. */
export class ConfigParseError extends Error {
  /**
   * Creates a parse error that points at the offending file.
   *
   * @param configPath Path of the configuration file.
   * @param cause Original parser error.
   */
  constructor(public readonly configPath: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Could not parse ${configPath}: ${message}`, { cause });
    this.name = "ConfigParseError";
  }
}

/**
 * Prepares the OpenCode and TUI configurations without writing anything.
 *
 * Existing user values win over template defaults. Arrays are treated as
 * atomic values so the installer never concatenates a user list behind their
 * back.
 *
 * @param repoRoot Absolute path to the cloned repository.
 * @param configRoot Absolute OpenCode config root.
 * @param options Optional settings.
 * @param options.force When true, an unparseable existing config is replaced
 * after a warning instead of aborting the install.
 * @returns Prepared values plus warnings.
 */
export async function prepareConfigs(
  repoRoot: string,
  configRoot: string,
  options: { force?: boolean } = {},
): Promise<PreparedConfigs> {
  return {
    openCode: await prepareOpenCodeConfig(repoRoot, configRoot, options.force ?? false),
    tui: await prepareTuiConfig(repoRoot, configRoot, options.force ?? false),
  };
}

/**
 * Deep-merges template defaults with a user value.
 *
 * @param defaults Values used only when the user has no value.
 * @param user User value, which always wins when present.
 * @returns Merged value.
 */
export function mergeConfigDefaults<T>(defaults: T, user: unknown): T {
  if (user === undefined) {
    return structuredClone(defaults);
  }

  if (isPlainRecord(defaults) && isPlainRecord(user)) {
    const merged = structuredClone(defaults) as Record<string, unknown>;
    for (const [key, userValue] of Object.entries(user)) {
      const defaultValue = (defaults as Record<string, unknown>)[key];
      merged[key] = key in (defaults as Record<string, unknown>)
        ? mergeConfigDefaults(defaultValue, userValue)
        : structuredClone(userValue);
    }
    return merged as T;
  }

  return structuredClone(user) as T;
}

/**
 * Returns true when a JSONC document contains comments outside string values.
 *
 * @param raw Raw JSONC text.
 * @returns True when line or block comments are present.
 */
export function hasJsonComments(raw: string): boolean {
  let insideString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index++) {
    const character = raw[index];
    const nextCharacter = raw[index + 1];

    if (insideString) {
      if (escaped) {
        escaped = false;
      }
      else if (character === "\\") {
        escaped = true;
      }
      else if (character === "\"") {
        insideString = false;
      }
      continue;
    }

    if (character === "\"") {
      insideString = true;
      continue;
    }

    if (character === "/" && (nextCharacter === "/" || nextCharacter === "*")) {
      return true;
    }
  }

  return false;
}

/**
 * Writes a prepared configuration file atomically.
 *
 * @param path Destination path.
 * @param value Configuration value.
 * @param dryRun When true, logs the write without touching the filesystem.
 */
export async function writeConfigFile(
  path: string,
  value: unknown,
  dryRun: boolean,
): Promise<void> {
  if (dryRun) {
    consola.log(`  [dry-run] write ${path}`);
    return;
  }

  const json = stringifyJSONC(value, { space: 2 } as never);
  await writeFileAtomic(path, `${json}\n`);
  consola.success(`ok  ${path}`);
}

async function prepareOpenCodeConfig(
  repoRoot: string,
  configRoot: string,
  force: boolean,
): Promise<PreparedConfig<OpenCodeConfig>> {
  const template = await readRequiredConfig(join(repoRoot, "config", "opencode.jsonc"));
  const warnings: string[] = [];
  const source = await readFirstExisting(getOpenCodeCandidates(configRoot), force, warnings);
  const userConfig = source ? structuredClone(source.value) : {};

  migrateSubagentDepth(userConfig, warnings);

  const value = mergeConfigDefaults(template, userConfig) as OpenCodeConfig;
  applyInstructions(value, warnings);

  const destinationPath = await resolveDestinationPath(
    configRoot,
    "opencode.jsonc",
    "opencode.json",
  );
  const changed = source === null
    || !deepEqual(value, source.value)
    || source.path !== destinationPath;

  if (changed && source && hasJsonComments(source.raw)) {
    warnings.push(
      `Comments in ${source.path} are not preserved when the installer rewrites the file.`,
    );
  }
  if (source && source.path !== destinationPath) {
    warnings.push(
      `Merged settings from ${source.path}; the installer writes ${destinationPath}.`,
    );
  }

  return { path: destinationPath, value, changed, warnings };
}

async function prepareTuiConfig(
  repoRoot: string,
  configRoot: string,
  force: boolean,
): Promise<PreparedConfig<OpenCodeTuiConfig>> {
  const templatePath = join(repoRoot, "config", "tui.jsonc");
  const template = await pathExists(templatePath)
    ? await readRequiredConfig(templatePath)
    : { $schema: "https://opencode.ai/tui.json", attention: { enabled: true } };
  const warnings: string[] = [];
  const source = await readFirstExisting(getTuiCandidates(configRoot), force, warnings);
  const value = mergeConfigDefaults(template, source?.value ?? {}) as OpenCodeTuiConfig;
  const destinationPath = await resolveDestinationPath(configRoot, "tui.jsonc", "tui.json");
  const changed = source === null
    || !deepEqual(value, source.value)
    || source.path !== destinationPath;

  if (changed && source && hasJsonComments(source.raw)) {
    warnings.push(
      `Comments in ${source.path} are not preserved when the installer rewrites the file.`,
    );
  }
  if (source && source.path !== destinationPath) {
    warnings.push(
      `Merged settings from ${source.path}; the installer writes ${destinationPath}.`,
    );
  }

  return { path: destinationPath, value, changed, warnings };
}

async function readRequiredConfig(path: string): Promise<Record<string, unknown>> {
  let raw: string;
  try {
    raw = await readFile(path, "utf-8");
  }
  catch {
    throw new Error(`Missing config template: ${path}`);
  }

  return parseConfigText(path, raw);
}

async function readFirstExisting(
  paths: string[],
  force: boolean,
  warnings: string[],
): Promise<ConfigSource | null> {
  for (const path of paths) {
    if (!(await pathExists(path))) {
      continue;
    }

    const raw = await readFile(path, "utf-8");
    try {
      return { path, raw, value: parseConfigText(path, raw) };
    }
    catch (error) {
      if (!force) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      warnings.push(
        `${message} Continuing because --force is set; the installer will use defaults for this source.`,
      );
      return null;
    }
  }

  return null;
}

function parseConfigText(path: string, raw: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = parseJSONC(raw);
  }
  catch (error) {
    throw new ConfigParseError(path, error);
  }

  if (!isPlainRecord(value)) {
    throw new ConfigParseError(path, new Error("Config root must be a JSON object"));
  }

  return value;
}

async function resolveDestinationPath(
  configRoot: string,
  jsoncName: string,
  jsonName: string,
): Promise<string> {
  const jsoncPath = join(configRoot, jsoncName);
  if (await pathExists(jsoncPath)) {
    return jsoncPath;
  }

  const jsonPath = join(configRoot, jsonName);
  if (await pathExists(jsonPath)) {
    return jsonPath;
  }

  return jsoncPath;
}

function getOpenCodeCandidates(configRoot: string): string[] {
  const candidates = [
    join(configRoot, "opencode.jsonc"),
    join(configRoot, "opencode.json"),
  ];

  if (process.env.OPENCODE_CONFIG) {
    candidates.unshift(resolve(process.env.OPENCODE_CONFIG));
  }

  return [...new Set(candidates)];
}

function getTuiCandidates(configRoot: string): string[] {
  const candidates = [
    join(configRoot, "tui.jsonc"),
    join(configRoot, "tui.json"),
  ];

  if (process.env.OPENCODE_TUI_CONFIG) {
    candidates.unshift(resolve(process.env.OPENCODE_TUI_CONFIG));
  }

  return [...new Set(candidates)];
}

function applyInstructions(config: OpenCodeConfig, warnings: string[]): void {
  if (config.instructions === undefined) {
    config.instructions = ["AGENTS.md"];
    return;
  }

  if (!Array.isArray(config.instructions)) {
    warnings.push("instructions is not an array; left unchanged.");
    return;
  }

  if (!config.instructions.includes("AGENTS.md")) {
    config.instructions.push("AGENTS.md");
  }
}

function migrateSubagentDepth(
  config: Record<string, unknown>,
  warnings: string[],
): void {
  const legacyDepth = config.subagent_depth;
  if (legacyDepth === undefined) {
    return;
  }

  delete config.subagent_depth;

  if (typeof legacyDepth !== "number" || !Number.isInteger(legacyDepth) || legacyDepth < 0) {
    warnings.push(
      "Ignored invalid top-level subagent_depth; use a non-negative integer under experimental.",
    );
    return;
  }

  const experimental = isPlainRecord(config.experimental) ? config.experimental : {};
  if (experimental.subagent_depth === undefined) {
    experimental.subagent_depth = legacyDepth;
    warnings.push("Moved top-level subagent_depth to experimental.subagent_depth.");
  }
  else {
    warnings.push("Removed top-level subagent_depth; experimental.subagent_depth already exists.");
  }

  config.experimental = experimental;
}
