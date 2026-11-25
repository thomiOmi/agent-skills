import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { parseJSONC, stringifyJSONC } from "confbox";
import { consola } from "consola";
import { deepEqual, isPlainRecord, pathExists, writeFileAtomic } from "./utils";

export interface OpenCodeConfig {
  [key: string]: unknown;
  $schema?: string;
  default_agent?: string;
  instructions?: string[];
  experimental?: Record<string, unknown>;
}

export interface OpenCodeCliConfig {
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
  cli: PreparedConfig<OpenCodeCliConfig>;
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
 * Prepares the OpenCode server and terminal client configurations without writing anything.
 *
 * Existing user values win over template defaults. Arrays are treated as
 * atomic values so the installer never concatenates a user list behind their
 * back.
 *
 * @param repoRoot Absolute path to the cloned repository.
 * @param configRoot Absolute OpenCode config root.
 * @param options Optional settings.
 * @param options.force When true, a malformed config with no valid fallback is
 * skipped after a warning instead of aborting the install.
 * @returns Prepared values plus warnings.
 */
export async function prepareConfigs(
  repoRoot: string,
  configRoot: string,
  options: { force?: boolean } = {},
): Promise<PreparedConfigs> {
  return {
    openCode: await prepareOpenCodeConfig(repoRoot, configRoot, options.force ?? false),
    cli: await prepareCliConfig(repoRoot, configRoot, options.force ?? false),
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
      merged[key] = Object.hasOwn(defaults, key)
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

  const json = stringifyJSONC(value, { indent: 2 });
  await writeFileAtomic(path, `${json}\n`);
  consola.success(`ok  ${path}`);
}

interface PrepareConfigOptions {
  configRoot: string;
  destinationJsonc: string;
  destinationJson: string;
  force: boolean;
  getCandidates: (configRoot: string) => string[];
  migrateSubagentDepth?: boolean;
  transformSource?: (config: Record<string, unknown>, warnings: string[]) => void;
  readTemplate: (repoRoot: string) => Promise<Record<string, unknown>>;
  applyInstructions?: (config: Record<string, unknown>, warnings: string[]) => void;
}

async function prepareConfig(
  repoRoot: string,
  options: PrepareConfigOptions,
): Promise<PreparedConfig<Record<string, unknown>>> {
  const template = await options.readTemplate(repoRoot);
  const warnings: string[] = [];
  const source = await readFirstExisting(options.getCandidates(options.configRoot), options.force, warnings);
  const userConfig = source ? structuredClone(source.value) : {};

  if (options.migrateSubagentDepth) {
    migrateSubagentDepth(userConfig, warnings);
  }
  if (options.transformSource) {
    options.transformSource(userConfig, warnings);
  }

  const value = mergeConfigDefaults(template, userConfig);

  if (options.applyInstructions) {
    options.applyInstructions(value, warnings);
  }

  const destinationPath = await resolveDestinationPath(
    options.configRoot,
    options.destinationJsonc,
    options.destinationJson,
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

async function prepareOpenCodeConfig(
  repoRoot: string,
  configRoot: string,
  force: boolean,
): Promise<PreparedConfig<OpenCodeConfig>> {
  const result = await prepareConfig(repoRoot, {
    configRoot,
    destinationJsonc: "opencode.jsonc",
    destinationJson: "opencode.json",
    force,
    getCandidates: getOpenCodeCandidates,
    migrateSubagentDepth: true,
    readTemplate: async repoRootParam => readRequiredConfig(join(repoRootParam, "config", "opencode.jsonc")),
    applyInstructions,
  });

  return result;
}

async function prepareCliConfig(
  repoRoot: string,
  configRoot: string,
  force: boolean,
): Promise<PreparedConfig<OpenCodeCliConfig>> {
  const templatePath = join(repoRoot, "config", "cli.json");
  if (process.env.OPENCODE_CLI_CONFIG_CONTENT !== undefined) {
    // The terminal client merges this inline override at runtime; the installer
    // must not write it into the global file.
    consola.warn(
      "OPENCODE_CLI_CONFIG_CONTENT is applied by OpenCode at runtime and is not merged into the global file.",
    );
  }
  return prepareConfig(repoRoot, {
    configRoot,
    destinationJsonc: "cli.json",
    destinationJson: "cli.json",
    force,
    getCandidates: getCliCandidates,
    transformSource: migrateLegacyAttention,
    readTemplate: async (_repoRootParam) => {
      if (await pathExists(templatePath)) {
        return readRequiredConfig(templatePath);
      }
      return {
        $schema: "https://opencode.ai/v2/cli.json",
        attention: { notifications: true, sound: true },
      };
    },
  });
}

/** Translates the V1 `attention.enabled` shape into V2 notification fields. */
function migrateLegacyAttention(config: Record<string, unknown>, warnings: string[]): void {
  const attention = config.attention;
  if (!isPlainRecord(attention) || typeof attention.enabled !== "boolean") {
    return;
  }
  const enabled = attention.enabled;
  delete attention.enabled;
  attention.notifications ??= enabled;
  attention.sound ??= enabled;
  warnings.push("Moved legacy attention.enabled to attention.notifications and attention.sound.");
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

/**
 * Returns the first parseable config candidate, or null when none are usable.
 *
 * @param paths Candidate config paths in priority order.
 * @param force Whether the warning mentions --force instead of the fallback.
 * @param warnings Warnings collected for the user.
 * @returns The selected source, or null when no candidate is usable.
 * @throws The first parse error when every existing candidate is malformed and
 * force is false.
 */
async function readFirstExisting(
  paths: string[],
  force: boolean,
  warnings: string[],
): Promise<ConfigSource | null> {
  const errors: unknown[] = [];

  for (const path of paths) {
    if (!(await pathExists(path))) {
      continue;
    }

    const raw = await readFile(path, "utf-8");
    try {
      return { path, raw, value: parseConfigText(path, raw) };
    }
    catch (error) {
      errors.push(error);

      // A broken candidate must not hide a valid later one. Defer the error
      // until every candidate has been tried so a valid fallback can win.
      const message = error instanceof Error ? error.message : String(error);
      warnings.push(force
        ? `${message} Continuing because --force is set; skipping this source.`
        : `${message} Continuing with the next configuration candidate; skipping this source.`);
    }
  }

  // Without force, every malformed candidate being exhausted is fatal. Force
  // keeps its existing override: skip them all and fall back to defaults.
  if (errors.length > 0 && !force) {
    throw errors[0];
  }

  return null;
}

function parseConfigText(path: string, raw: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = parseJSONC(raw, { allowTrailingComma: true });
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

  if (process.env.OPENCODE_CONFIG !== undefined) {
    candidates.unshift(resolve(process.env.OPENCODE_CONFIG));
  }

  return [...new Set(candidates)];
}

function getCliCandidates(configRoot: string): string[] {
  // Native V2 file first; legacy V1 files are read only as migration sources.
  return [...new Set([
    join(configRoot, "cli.json"),
    join(configRoot, "cli.jsonc"),
    join(configRoot, "tui.json"),
    join(configRoot, "tui.jsonc"),
  ])];
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
