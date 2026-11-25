import { Plugin } from "@opencode/plugin";

/**
 * Tool Guardian - blocks irreversible destructive bash commands.
 *
 * Intercepts shell commands before execution and throws on commands that
 * are catastrophic or hard to reverse:
 * - recursive force delete targeting filesystem roots, home, or wildcards,
 *   including glob forms (`/*`, `~/*`, `$HOME/*`, `C:\*`), quoted home vars
 *   (`"$HOME"`, `"$env:USERPROFILE"`), traversal forms that resolve to a
 *   root (`/.`, `/..`, `/tmp/..`), relative escapes (`../..`, `../*`), and
 *   uppercase flag variants (`-RF`, `-rF`)
 * - Windows-native `del` / `rmdir` with `/s` plus `/q` or `/f` against those
 *   same targets
 * - git force push (except a genuine --force-with-lease in the same invocation)
 * - filesystem creation/format tools (mkfs, fdisk, dd to /dev, format x:)
 * - DROP TABLE / DROP DATABASE / DROP SCHEMA statements
 * - chmod -R / --recursive 777 on /, /., ~, or $HOME
 *
 * Command chains are split on shell separators so a dangerous subcommand
 * cannot hide after `;`, `|`, `&`, a newline, or parentheses. Specific-path
 * deletes (rm -rf node_modules, rm -rf /tmp/build) and recoverable operations
 * (git reset --hard) are deliberately allowed.
 * Permission prompts for shell commands remain governed by opencode.json config; this
 * guard is an additional safety layer, not a permission system.
 *
 * Disable this plugin via OpenCode config: add `-agent-skills.tool-guardian`
 * to the `plugins` array in opencode.jsonc.
 */

const DELETE_COMMAND = /\b(?:rm|remove-item|del|rmdir)\b/i;
const COMMAND_SEPARATOR = /[;&|\n()]+/;

function hasRecursiveFlag(command: string): boolean {
  return /(?:^|\s)-\w*r/i.test(command)
    || /(?:^|\s)(?:--recursive|-recurse)\b/i.test(command)
    || /(?:^|\s)\/s(?:\s|$)/i.test(command); // cmd-style del / rmdir
}

function hasForceFlag(command: string): boolean {
  // Case-insensitive so `-RF` and `-rF` cannot slip past the guard.
  return /(?:^|\s)-\w*f/i.test(command)
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
 * True when a relative token walks out through `..` segments. Two or more
 * parent hops escape the working tree; a single hop is catastrophic only
 * when the rest of the token is a bare wildcard (`../*`).
 */
function isRelativeEscapeTarget(token: string): boolean {
  const segments = token.split("/").filter(segment => segment !== "" && segment !== ".");
  let parentHops = 0;
  for (const segment of segments) {
    if (segment !== "..") {
      break;
    }
    parentHops += 1;
  }
  if (parentHops === 0) {
    return false;
  }
  if (parentHops >= 2) {
    return true;
  }
  const remainder = segments.slice(parentHops).join("/");
  return remainder === "*";
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
  if (isRelativeEscapeTarget(token)) {
    return true;
  }
  const starIndex = token.indexOf("*");
  const base = starIndex >= 0 ? token.slice(0, starIndex) : token;
  if (starIndex >= 0) {
    return isRootBase(base) || isHomeBase(base) || isDriveRoot(base);
  }
  return isDotTarget(token) || isRootBase(token) || isHomeBase(token) || isDriveRoot(token);
}

/**
 * True when any shell subcommand is a recursive force delete of a
 * catastrophic target. Splitting on shell separators prevents a trailing
 * `;`, `|`, or newline from hiding the dangerous operand inside a token.
 */
function isRecursiveForceDelete(command: string): boolean {
  return command.split(COMMAND_SEPARATOR).some((subcommand) => {
    if (!DELETE_COMMAND.test(subcommand)) {
      return false;
    }
    if (!hasRecursiveFlag(subcommand) || !hasForceFlag(subcommand)) {
      return false;
    }
    return subcommand.split(/\s+/).some(isCatastrophicTarget);
  });
}

/**
 * True when a `git push` invocation in the chain uses a real force flag.
 * The --force-with-lease exemption is scoped to the same subcommand and only
 * counts as a standalone option, so an unrelated lease mention cannot excuse
 * a force push, and `--force-with-lease=x` forms fail closed.
 */
function isForcePush(command: string): boolean {
  return command.split(COMMAND_SEPARATOR).some((subcommand) => {
    if (!/\bgit\s+push\b/.test(subcommand)) {
      return false;
    }
    if (/(?:^|\s)--force-with-lease(?:\s|$)/.test(subcommand)) {
      return false;
    }
    return /(?:^|\s)--force(?:\s|$)|(?:^|\s)-f(?:\s|$)/.test(subcommand);
  });
}

// Anchored to command position so an argument such as `echo fdisk` is safe.
const DISK_DESTROY: RegExp[] = [
  /^\s*(?:sudo\s+)?mkfs(?:\.\w+)?\b/i,
  /^\s*(?:sudo\s+)?dd\b[^;&|]+\bof=\/dev\//i,
  /^\s*(?:sudo\s+)?fdisk\b/i,
  /^\s*(?:sudo\s+)?format\s+[a-z]:/i,
];

const SQL_DROP = /\bdrop\s+(?:table|database|schema)\b/i;

/**
 * True when a subcommand is a recursive chmod 777 whose target is a
 * catastrophic delete target (/, /., ~, $HOME, or a wildcard there).
 */
function isChmodRoot(command: string): boolean {
  return command.split(COMMAND_SEPARATOR).some((subcommand) => {
    const match = /^\s*(?:sudo\s+)?chmod\s+(?:-R|--recursive)\s+777\s+(\S+)/i.exec(subcommand);
    return match !== null && isCatastrophicTarget(match[1] ?? "");
  });
}

export function findDangerousCommand(command: string): string | null {
  if (isRecursiveForceDelete(command)) {
    return "Recursive force delete targeting a filesystem root, home directory, or wildcard";
  }
  if (isForcePush(command)) {
    return "git force push (use --force-with-lease instead, or never rewrite shared history)";
  }
  for (const subcommand of command.split(COMMAND_SEPARATOR)) {
    for (const pattern of DISK_DESTROY) {
      if (pattern.test(subcommand)) {
        return "Disk or filesystem destroy command";
      }
    }
  }
  if (SQL_DROP.test(command)) {
    return "DROP TABLE / DATABASE / SCHEMA statement";
  }
  if (isChmodRoot(command)) {
    return "chmod -R 777 on / or ~";
  }
  return null;
}

/**
 * Throws when a shell command matches a destructive rule.
 * Exported for direct use in tests.
 */
export function guardBashCommand(command: string): void {
  const finding = findDangerousCommand(command);
  if (finding !== null) {
    throw new Error(
      `Blocked by tool-guardian: ${finding}. `
      + "Confirm the command manually with the user before running it. "
      + "To disable this plugin, add `-agent-skills.tool-guardian` to the plugins array in opencode.jsonc.",
    );
  }
}

/**
 * V2 plugin definition. Registers a shell creation hook so destructive
 * commands are blocked before the command starts.
 */
export const ToolGuardianPlugin = Plugin.define({
  id: "agent-skills.tool-guardian",
  async setup(context) {
    await context.shell.hook("create.before", async (event) => {
      if (!event.command) {
        return;
      }
      guardBashCommand(event.command);
    });
  },
});

export default ToolGuardianPlugin;
