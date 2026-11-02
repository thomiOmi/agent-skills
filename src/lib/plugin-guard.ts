import process from "node:process";

/**
 * Shared escape-hatch helper for OpenCode V2 plugins.
 *
 * Returns true when the given environment variable is set to "1", allowing
 * operators to bypass a plugin's safety guard without editing code.
 *
 * @param envVar Environment variable name (e.g. AGENT_SKILLS_DISABLE_SECRETS_SCANNER).
 * @returns True when the escape hatch is enabled.
 */
export function isPluginDisabled(envVar: string): boolean {
  return process.env[envVar] === "1";
}
