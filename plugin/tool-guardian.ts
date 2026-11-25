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
 * Command chains are split on shell separators (including backticks) so a
 * dangerous subcommand cannot hide after `;`, `|`, `&`, a newline, a backtick,
 * or parentheses. Privilege prefixes such as `sudo -u root` and `env VAR=x`
 * are stripped before matching. Specific-path deletes (rm -rf node_modules,
 * rm -rf /tmp/build) and recoverable operations (git reset --hard) are
 * deliberately allowed.
 * Permission prompts for shell commands remain governed by opencode.json config; this
 * guard is an additional safety layer, not a permission system.
 *
 * Disable this plugin via OpenCode config: add `-agent-skills.tool-guardian`
 * to the `plugins` array in opencode.jsonc.
 */

const DELETE_COMMAND = /^(?:rm|remove-item|del|rmdir)\b/i;
const COMMAND_SEPARATOR = /[;&|\n()`]+/;
// sudo/env options that consume a following argument before the command token.
const OPTION_WITH_ARGUMENT = /^(?:-[ughDCpTtUr]|--(?:user|group|host|chdir|target|timeout))\s+\S+\s*/;
const OPTION_WITH_ARGUMENT_EXTRA = /^--(?:close-from|prompt|other-user)\s+\S+\s*/;

/**
 * Removes leading sudo/env invocations and their options so the destructive
 * command that follows sits at the start of the returned string.
 */
function stripPrivilegePrefix(command: string): string {
  let remainder = command.trimStart();
  for (;;) {
    const prefix = /^(?:sudo|env)\b\s*/.exec(remainder);
    if (prefix === null) {
      break;
    }
    remainder = remainder.slice(prefix[0].length);
    for (;;) {
      // Options taking a separate argument must consume it before the command
      // token; bare flags and VAR=value assignments consume only one token.
      const withArgument = OPTION_WITH_ARGUMENT.exec(remainder)
        ?? OPTION_WITH_ARGUMENT_EXTRA.exec(remainder);
      const assignment = /^\w+=\S+\s*/.exec(remainder);
      const flag = /^-[\w-]+(?:=\S+)?\s*/.exec(remainder);
      if (withArgument !== null) {
        remainder = remainder.slice(withArgument[0].length);
      }
      else if (assignment !== null) {
        remainder = remainder.slice(assignment[0].length);
      }
      else if (flag !== null) {
        remainder = remainder.slice(flag[0].length);
      }
      else {
        break;
      }
    }
  }
  return remainder;
}

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

const HOME_BASE = /^(?:~[\w.-]*|\$HOME|\$\{HOME\})(\/.*)?$/;
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
 * True when a relative token walks out through `..` segments. Every segment
 * is resolved against a stack so a `..` that appears after a named directory
 * still counts as an escape from the working tree.
 */
function isRelativeEscapeTarget(token: string): boolean {
  const segments = token.split("/").filter(segment => segment !== "" && segment !== ".");
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
  return false;
}

/**
 * True when a delete operand targets a filesystem root, the home directory,
 * or a bare wildcard there. Tokens are quote-stripped and slash-normalized
 * before matching, and a wildcard token is judged by its base path so that
 * `/*` and `~/*` are blocked while `./build/*` stays allowed.
 */
function isCatastrophicTarget(rawToken: string): boolean {
  const token = rawToken.replace(/["'`]/g, "").replace(/\\/g, "/");
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
    // Anchor the delete verb to command position so `echo rm -rf /` stays safe.
    const normalized = stripPrivilegePrefix(subcommand);
    if (!DELETE_COMMAND.test(normalized)) {
      return false;
    }
    if (!hasRecursiveFlag(normalized) || !hasForceFlag(normalized)) {
      return false;
    }
    return normalized.split(/\s+/).some(isCatastrophicTarget);
  });
}

// Git global options (-c, -C, --no-pager, etc.) may sit between `git` and
// `push`. Token scanning keeps this linear and avoids a backtracking regex.
function isGitPushInvocation(subcommand: string): boolean {
  const tokens = subcommand.trim().split(/\s+/);
  const gitIndex = tokens.findIndex(token => token.toLowerCase() === "git");
  if (gitIndex === -1) {
    return false;
  }

  let index = gitIndex + 1;
  while (index < tokens.length) {
    const token = tokens[index] ?? "";
    if (token.toLowerCase() === "push") {
      return true;
    }
    if (!token.startsWith("-")) {
      return false;
    }
    // -c and -C consume their following argument.
    if ((token === "-c" || token === "-C") && index + 1 < tokens.length) {
      index += 2;
      continue;
    }
    index += 1;
  }
  return false;
}

/**
 * True when a `git push` invocation in the chain uses a real force flag.
 * A standalone --force-with-lease exempts the push only when no bare force
 * flag and no --no-force-with-lease appears in the same subcommand.
 */
function isForcePush(command: string): boolean {
  return command.split(COMMAND_SEPARATOR).some((subcommand) => {
    if (!isGitPushInvocation(subcommand)) {
      return false;
    }
    const hasForce = /(?:^|\s)--force(?:\s|$)|(?:^|\s)-f(?:\s|$)/.test(subcommand);
    const hasLease = /(?:^|\s)--force-with-lease(?:\s|$)/.test(subcommand);
    const hasNoLease = /(?:^|\s)--no-force-with-lease(?:\s|$)/.test(subcommand);
    if (hasLease && !hasForce && !hasNoLease) {
      return false;
    }
    return hasForce || hasNoLease;
  });
}

// Anchored to command position so an argument such as `echo fdisk` is safe.
// Privilege prefixes are stripped by the caller before these patterns run.
const DISK_DESTROY: RegExp[] = [
  /^mkfs(?:\.\w+)?\b/i,
  /^dd\b[^;&|]+of=["']?\/dev\//i,
  /^fdisk\b/i,
  /^format\s+[a-z]:/i,
];

const SQL_DROP = /\bdrop\s+(?:table|database|schema)\b/i;

// Masks that grant world write access recursively on a catastrophic target.
const CHMOD_ROOT_MASK = /^(?:0?7777?|[augo]*\+(?=[rwx]*w)[rwx]+)$/i;

/**
 * True when a subcommand is a recursive chmod with a world-writable mask whose
 * target is a catastrophic delete target (/, /., ~, $HOME, or a wildcard).
 */
function isChmodRoot(command: string): boolean {
  return command.split(COMMAND_SEPARATOR).some((subcommand) => {
    const match = /^chmod\s+(?:-R|--recursive)\s+(\S+)\s+(\S+)/i.exec(stripPrivilegePrefix(subcommand));
    if (match === null) {
      return false;
    }
    return CHMOD_ROOT_MASK.test(match[1] ?? "") && isCatastrophicTarget(match[2] ?? "");
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
    const normalized = stripPrivilegePrefix(subcommand);
    for (const pattern of DISK_DESTROY) {
      if (pattern.test(normalized)) {
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
