import { Plugin } from "@opencode/plugin";

/**
 * Secrets Scanner - blocks tool calls that would write hardcoded secrets.
 *
 * Scans only content-bearing fields (content for write, newString for edit)
 * against known secret formats (AWS, GitHub, OpenAI, Anthropic, Stripe,
 * Google, Slack, private key blocks, generic credential assignments) and
 * throws before the tool executes when a likely secret is found. Placeholder
 * values such as "your-api-key-here" are ignored to avoid false positives.
 *
 * Large content is scanned at both ends; content too large to scan fully
 * fails closed. Findings for generic assignments never echo a secret prefix.
 *
 * Scope: only file-writing tools (write, edit). Reading .env files and
 * running bash commands are out of scope for this guard.
 *
 * Disable this plugin via OpenCode config: add `-agent-skills.secrets-scanner`
 * to the `plugins` array in opencode.jsonc.
 */

interface SecretPattern {
  name: string;
  pattern: RegExp;
}

const SECRET_PATTERNS: SecretPattern[] = [
  { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  {
    name: "AWS secret access key",
    pattern: /\baws.{0,30}?secret.{0,30}?[A-Z0-9/+=]{32,}/i,
  },
  { name: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: "OpenAI or Anthropic API key", pattern: /\bsk-[\w-]{20,}\b/ },
  { name: "Stripe API key", pattern: /\bsk_(live|test)_[A-Za-z0-9]{16,}\b/ },
  { name: "Google API key", pattern: /\bAIza[\w-]{35,}/ },
  { name: "Slack token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    name: "Private key block",
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----/,
  },
];

const CREDENTIAL_FIELDS
  = "api[_-]?key|api[_-]?secret|secret[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password";

// Quoted values cover the common cases; backticks and bare values extend
// coverage to template literals and unquoted assignments.
const CREDENTIAL_ASSIGNMENT = new RegExp(
  `\\b(${CREDENTIAL_FIELDS})\\s*[:=]\\s*(?:\`([^\`\\n]{12,})\`|"([^"\\n]{12,})"|'([^'\\n]{12,})'|([\\w+/=-]{12,})(?=[\\s,;)}\\]]|$))`,
  "gi",
);

const PLACEHOLDER_VALUE
  = /^(?:\$\{|<|%[A-Z_]+%|your|example|sample|placeholder|changeme|dummy|xxx|\*+|test[-_]?key|insert|replace)/i;
const TEMPLATE_EXPRESSION = /\$\{/;

const MAX_SCAN_CHARS = 100_000;
const MAX_DEPTH = 4;
const CONTENT_FIELDS: Record<string, readonly string[]> = {
  write: ["content"],
  edit: ["newString"],
};

/**
 * Redacts a finding. A prefix is exposed only for public token formats whose
 * leading characters identify the provider rather than the secret itself.
 */
function mask(value: string, revealPrefix: boolean): string {
  return revealPrefix ? `${value.slice(0, 4)}****` : "****";
}

/** Scans one bounded chunk and returns a finding or null. */
function scanChunk(text: string): string | null {
  for (const { name, pattern } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match !== null) {
      return `${name} (${mask(match[0], true)})`;
    }
  }
  CREDENTIAL_ASSIGNMENT.lastIndex = 0;
  let assignment: RegExpExecArray | null = CREDENTIAL_ASSIGNMENT.exec(text);
  while (assignment !== null) {
    const value = assignment[2] ?? assignment[3] ?? assignment[4] ?? assignment[5] ?? "";
    const isUnquoted = assignment[5] !== undefined;
    // Bare values are only flagged when they look like generated credentials;
    // plain identifiers and property chains stay allowed.
    if (isUnquoted && !/\d/.test(value)) {
      assignment = CREDENTIAL_ASSIGNMENT.exec(text);
      continue;
    }
    if (value !== "" && !PLACEHOLDER_VALUE.test(value) && !TEMPLATE_EXPRESSION.test(value)) {
      return `Hardcoded credential assignment: ${assignment[1]} = ${mask(value, false)}`;
    }
    assignment = CREDENTIAL_ASSIGNMENT.exec(text);
  }
  return null;
}

/**
 * Scans text for likely secrets. Content beyond two scan windows cannot be
 * verified, so it fails closed with an explicit finding.
 */
export function scanForSecrets(text: string): string | null {
  if (text.length > MAX_SCAN_CHARS * 2) {
    return "Unscanned content exceeds the safe scan limit";
  }
  const chunks = text.length > MAX_SCAN_CHARS
    ? [text.slice(0, MAX_SCAN_CHARS), text.slice(-MAX_SCAN_CHARS)]
    : [text];
  for (const chunk of chunks) {
    const finding = scanChunk(chunk);
    if (finding !== null) {
      return finding;
    }
  }
  return null;
}

/**
 * Collects strings only from content-bearing fields so filePath and oldString
 * cannot trigger a false positive when a secret is being removed.
 */
function collectContentStrings(
  value: unknown,
  contentFields: readonly string[],
  depth: number,
  visited: WeakSet<object>,
  out: string[],
): void {
  if (depth > MAX_DEPTH || out.length > 512) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectContentStrings(item, contentFields, depth + 1, visited, out);
    }
    return;
  }
  if (value === null || typeof value !== "object") {
    return;
  }
  if (visited.has(value)) {
    return;
  }
  visited.add(value);
  for (const [key, item] of Object.entries(value)) {
    if (contentFields.includes(key) && typeof item === "string") {
      out.push(item);
      continue;
    }
    collectContentStrings(item, contentFields, depth + 1, visited, out);
  }
}

/**
 * Throws when a content-bearing field in the tool args contains a likely
 * secret. The optional contentFields argument keeps direct callers compatible.
 */
export function guardToolCall(
  tool: string,
  args: unknown,
  contentFields: readonly string[] = CONTENT_FIELDS[tool] ?? ["content", "newString"],
): void {
  const strings: string[] = [];
  collectContentStrings(args, contentFields, 0, new WeakSet(), strings);
  for (const text of strings) {
    const finding = scanForSecrets(text);
    if (finding !== null) {
      throw new Error(
        `Blocked by secrets-scanner: ${finding}. `
        + "Remove the secret from the content and use environment variables or a secrets manager instead. "
        + "To disable this plugin, add `-agent-skills.secrets-scanner` to the plugins array in opencode.jsonc.",
      );
    }
  }
}

/**
 * V2 plugin definition. Registers a tool execution hook that scans write and
 * edit inputs before they reach the filesystem.
 */
export const SecretsScannerPlugin = Plugin.define({
  id: "agent-skills.secrets-scanner",
  async setup(context) {
    await context.tool.hook("execute.before", async (event) => {
      if (event.tool !== "write" && event.tool !== "edit") {
        return;
      }
      guardToolCall(event.tool, event.input, CONTENT_FIELDS[event.tool]);
    });
  },
});

export default SecretsScannerPlugin;
