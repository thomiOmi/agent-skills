import type { Plugin } from "@opencode-ai/plugin";
import process from "node:process";

/**
 * Tool Guardian - blocks irreversible destructive bash commands.
 *
 * Intercepts bash tool calls before execution and throws on commands that
 * are catastrophic or hard to reverse:
 * - recursive force delete targeting filesystem roots, home, or wildcards
 * - git force push (except --force-with-lease)
 * - filesystem creation/format tools (mkfs, fdisk, dd to /dev, format x:)
 * - DROP TABLE / DROP DATABASE / DROP SCHEMA statements
 * - chmod -R 777 on / or ~
 *
 * Specific-path deletes (rm -rf node_modules) and recoverable operations
 * (git reset --hard) are deliberately allowed. Permission prompts for bash
 * remain governed by opencode.json config; this guard is an additional
 * safety layer, not a permission system.
 *
 * Escape hatch: set AGENT_SKILLS_DISABLE_TOOL_GUARDIAN=1 to disable.
 */

const DELETE_TARGET = /(?:^|\s)(?:\/|~\/?|\$HOME\/?|\*|\.\.?\/?|C:[\\/]?)(?:\s|$)/;

function isRecursiveForceDelete(command: string): boolean {
  if (!/\brm\b|\bremove-item\b/i.test(command)) {
    return false;
  }
  const hasRecursive = /(?:^|\s)-\w*r/i.test(command) || /(?:^|\s)(?:--recursive|-recurse)\b/i.test(command);
  const hasForce = /(?:^|\s)-\w*f/.test(command) || /(?:^|\s)(?:--force|-force)\b/i.test(command);
  if (!hasRecursive || !hasForce) {
    return false;
  }
  return DELETE_TARGET.test(command);
}

function isForcePush(command: string): boolean {
  if (!/\bgit\s+push\b/.test(command)) {
    return false;
  }
  if (/--force-with-lease/.test(command)) {
    return false;
  }
  return /\s--force\b|\s-f\b/.test(command);
}

const DISK_DESTROY: RegExp[] = [
  /\bmkfs(\.\w+)?\b/,
  /\bdd\b[^;&|]+\bof=\/dev\//,
  /\bfdisk\b/,
  /\bformat\s+[a-z]:/i,
];

const SQL_DROP = /\bdrop\s+(?:table|database|schema)\b/i;

const CHMOD_ROOT = /\bchmod\s+-R\s+777\s+(?:\/|~)(?:\s|$)/;

export function findDangerousCommand(command: string): string | null {
  if (isRecursiveForceDelete(command)) {
    return "Recursive force delete targeting a filesystem root, home directory, or wildcard";
  }
  if (isForcePush(command)) {
    return "git force push (use --force-with-lease instead, or never rewrite shared history)";
  }
  for (const pattern of DISK_DESTROY) {
    if (pattern.test(command)) {
      return "Disk or filesystem destroy command";
    }
  }
  if (SQL_DROP.test(command)) {
    return "DROP TABLE / DATABASE / SCHEMA statement";
  }
  if (CHMOD_ROOT.test(command)) {
    return "chmod -R 777 on / or ~";
  }
  return null;
}

/**
 * Throws when a bash command matches a destructive rule.
 * Exported for direct use in tests.
 */
export function guardBashCommand(command: string): void {
  const finding = findDangerousCommand(command);
  if (finding) {
    throw new Error(
      `Blocked by tool-guardian: ${finding}. `
      + "Confirm the command manually with the user before running it. "
      + "If this is a false positive, set AGENT_SKILLS_DISABLE_TOOL_GUARDIAN=1 to bypass.",
    );
  }
}

export const ToolGuardianPlugin: Plugin = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (process.env.AGENT_SKILLS_DISABLE_TOOL_GUARDIAN === "1") {
        return;
      }
      if (input.tool !== "bash") {
        return;
      }
      const command = typeof output.args?.command === "string" ? output.args.command : "";
      if (!command) {
        return;
      }
      guardBashCommand(command);
    },
  };
};
