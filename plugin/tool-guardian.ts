import type { Plugin } from "@opencode-ai/plugin";
import process from "node:process";

/**
 * Tool Guardian - blocks irreversible destructive bash commands.
 *
 * Intercepts bash tool calls before execution and throws on commands that
 * are catastrophic or hard to reverse:
 * - recursive force delete targeting filesystem roots, home, or wildcards,
 *   including glob forms (`/*`, `~/*`, `$HOME/*`, `C:\*`), quoted home vars
 *   (`"$HOME"`, `"$env:USERPROFILE"`), and traversal forms that resolve to
 *   a root (`/.`, `/..`, `/tmp/..`)
 * - Windows-native `del` / `rmdir` with `/s` plus `/q` or `/f` against those
 *   same targets
 * - git force push (except --force-with-lease)
 * - filesystem creation/format tools (mkfs, fdisk, dd to /dev, format x:)
 * - DROP TABLE / DROP DATABASE / DROP SCHEMA statements
 * - chmod -R 777 on / or ~
 *
 * Specific-path deletes (rm -rf node_modules, rm -rf /tmp/build) and
 * recoverable operations (git reset --hard) are deliberately allowed.
 * Permission prompts for bash remain governed by opencode.json config; this
 * guard is an additional safety layer, not a permission system.
 *
 * Escape hatch: set AGENT_SKILLS_DISABLE_TOOL_GUARDIAN=1 to disable.
 */

const DELETE_COMMAND = /\b(?:rm|remove-item|del|rmdir)\b/i;

function hasRecursiveFlag(command: string): boolean {
  return /(?:^|\s)-\w*r/i.test(command)
    || /(?:^|\s)(?:--recursive|-recurse)\b/i.test(command)
    || /(?:^|\s)\/s(?:\s|$)/i.test(command); // cmd-style del / rmdir
}

function hasForceFlag(command: string): boolean {
  return /(?:^|\s)-\w*f/.test(command)
    || /(?:^|\s)(?:--force|-force)\b/i.test(command)
    || /(?:^|\s)\/[qf](?:\s|$)/i.test(command); // cmd-style quiet / force
}

/** Resolves a slash-prefixed path lexically; true when it lands on the root. */
function resolvesToRoot(path: string): boolean {
  const segments = path.split("/").filter(segment => segment !== "" && segment !== ".");
  const stack: string[] = [];
  for (const segment of segments) {
    if (segment === "..") {
      if (stack.length === 0) {
        return true;
      }
      stack.pop();
    }
    else {
      stack.push(segment);
    }
  }
  return stack.length === 0;
}

function isRootBase(target: string): boolean {
  return target.startsWith("/") && resolvesToRoot(target);
}

const HOME_BASE = /^(?:~|\$HOME|\$\{HOME\})(\/.*)?$/;
const PS_HOME_BASE = /^\$env:(?:USERPROFILE|HOME)(\/.*)?$/i;

function isHomeBase(target: string): boolean {
  const match = HOME_BASE.exec(target) ?? PS_HOME_BASE.exec(target);
  if (!match) {
    return false;
  }
  const rest = match[1] ?? "";
  return rest === "" || resolvesToRoot(rest);
}

function isDriveRoot(target: string): boolean {
  return /^[a-z]:\/?$/i.test(target);
}

function isDotTarget(target: string): boolean {
  return /^\.{1,2}\/?$/.test(target);
}

/**
 * True when a delete operand targets a filesystem root, the home directory,
 * or a bare wildcard there. Tokens are quote-stripped and slash-normalized
 * before matching, and a wildcard token is judged by its base path so that
 * `/*` and `~/*` are blocked while `./build/*` stays allowed.
 */
function isCatastrophicTarget(rawToken: string): boolean {
  const token = rawToken.replace(/["']/g, "").replace(/\\/g, "/");
  if (token === "*") {
    return true;
  }
  const starIndex = token.indexOf("*");
  const base = starIndex >= 0 ? token.slice(0, starIndex) : token;
  if (starIndex >= 0) {
    return isRootBase(base) || isHomeBase(base) || isDriveRoot(base);
  }
  return isDotTarget(token) || isRootBase(token) || isHomeBase(token) || isDriveRoot(token);
}

function isRecursiveForceDelete(command: string): boolean {
  if (!DELETE_COMMAND.test(command)) {
    return false;
  }
  if (!hasRecursiveFlag(command) || !hasForceFlag(command)) {
    return false;
  }
  // Every whitespace-separated token is checked; flag tokens never match the
  // target predicates above, so scanning them is safe.
  return command.split(/\s+/).some(isCatastrophicTarget);
}

function isForcePush(command: string): boolean {
  if (!/\bgit\s+push\b/.test(command)) {
    return false;
  }
  if (/--force-with-lease/.test(command)) {
    return false;
  }
  // Boundary-terminated match so safe variants like --force-if-includes
  // are not blocked alongside the real --force flag.
  return /\s--force(?:\s|$)|\s-f(?:\s|$)/.test(command);
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
