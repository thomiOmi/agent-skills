import type { Plugin } from "@opencode-ai/plugin";
import process from "node:process";

/**
 * Secrets Scanner - blocks tool calls that would write hardcoded secrets.
 *
 * Scans the string arguments of write and edit tool calls against known
 * secret formats (AWS, GitHub, OpenAI, Anthropic, Stripe, Google, Slack,
 * private key blocks, generic credential assignments) and throws before the
 * tool executes when a likely secret is found. Placeholder values such as
 * "your-api-key-here" are ignored to avoid false positives.
 *
 * Scope: only file-writing tools (write, edit). Reading .env files and
 * running bash commands are out of scope for this guard.
 *
 * Escape hatch: set AGENT_SKILLS_DISABLE_SECRETS_SCANNER=1 to disable.
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
const CREDENTIAL_ASSIGNMENT = new RegExp(
  `\\b(${CREDENTIAL_FIELDS})\\s*[:=]\\s*["']([^"']{12,})["']`,
  "gi",
);

const PLACEHOLDER_VALUE
  = /^(?:\$\{|<|%[A-Z_]+%|your|example|sample|placeholder|changeme|dummy|xxx|\*+|test[-_]?key|insert|replace)/i;

const MAX_SCAN_CHARS = 100_000;
const MAX_DEPTH = 4;

function mask(value: string): string {
  return `${value.slice(0, 4)}****`;
}

export function scanForSecrets(text: string): string | null {
  if (text.length > MAX_SCAN_CHARS) {
    text = text.slice(0, MAX_SCAN_CHARS);
  }
  for (const { name, pattern } of SECRET_PATTERNS) {
    const match = pattern.exec(text);
    if (match?.[0]) {
      return `${name} (${mask(match[0])})`;
    }
  }
  CREDENTIAL_ASSIGNMENT.lastIndex = 0;
  let assignment: RegExpExecArray | null = CREDENTIAL_ASSIGNMENT.exec(text);
  while (assignment !== null) {
    const value = assignment[2] ?? "";
    if (!PLACEHOLDER_VALUE.test(value)) {
      return `Hardcoded credential assignment: ${assignment[1]} = ${mask(value)}`;
    }
    assignment = CREDENTIAL_ASSIGNMENT.exec(text);
  }
  return null;
}

function collectStrings(value: unknown, depth: number, out: string[]): void {
  if (depth > MAX_DEPTH || out.length > 512) {
    return;
  }
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, depth + 1, out);
    }
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectStrings(item, depth + 1, out);
    }
  }
}

/**
 * Throws when any string value in the tool args contains a likely secret.
 * Exported for direct use in tests.
 */
export function guardToolCall(_tool: string, args: unknown): void {
  const strings: string[] = [];
  collectStrings(args, 0, strings);
  for (const text of strings) {
    const finding = scanForSecrets(text);
    if (finding) {
      throw new Error(
        `Blocked by secrets-scanner: ${finding}. `
        + "Remove the secret from the content and use environment variables or a secrets manager instead. "
        + "If this is a false positive, set AGENT_SKILLS_DISABLE_SECRETS_SCANNER=1 to bypass.",
      );
    }
  }
}

export const SecretsScannerPlugin: Plugin = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (process.env.AGENT_SKILLS_DISABLE_SECRETS_SCANNER === "1") {
        return;
      }
      if (input.tool !== "write" && input.tool !== "edit") {
        return;
      }
      guardToolCall(input.tool, output.args);
    },
  };
};
