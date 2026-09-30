import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface VerificationDetail {
  criterion: string
  passed: boolean
  message: string
}

export interface VerificationOptions {
  checkLint?: boolean
  checkTypecheck?: boolean
  checkTests?: boolean
  checkNoDebug?: boolean
  checkDocstrings?: boolean
  /** Project root used to resolve package.json scripts and relative file paths. Defaults to process.cwd(). */
  cwd?: string
}

export interface VerificationResult {
  pass: boolean
  details: VerificationDetail[]
}

const DEBUG_PATTERN = /\bconsole\.(log|debug|info|warn|error)\s*\(|\bdebugger\b|^\s*print\s*\(/;
const EXPORT_DECLARATION
  = /^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function\s*\*?|class|const|let|var)\s+[A-Za-z_$][\w$]*/;
const DOCSTRING_MARK = /\/\*\*/;
const DOCSTRING_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const MAX_LISTED = 5;

interface CommandOutcome {
  passed: boolean
  message: string
}

function runCommand(command: string, args: string[], cwd: string, useShell: boolean): CommandOutcome {
  const description = `${command} ${args.join(" ")}`;
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: useShell,
    env: { ...process.env, CI: "1" },
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
  const tail = output.length > 800 ? `...${output.slice(-800)}` : output;
  if (result.status === 0) {
    return { passed: true, message: `${description} passed` };
  }
  return { passed: false, message: `${description} failed (exit ${result.status ?? "unknown"})${tail ? `:\n${tail}` : ""}` };
}

function readPackageJson(cwd: string): Record<string, unknown> | null {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
  }
  catch {
    return null;
  }
}

function hasScript(pkg: Record<string, unknown> | null, name: string): boolean {
  const scripts = pkg?.scripts as Record<string, unknown> | undefined;
  return typeof scripts?.[name] === "string";
}

function packageManager(cwd: string): string {
  const usesBun = existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"));
  if (usesBun) {
    return "bun";
  }
  // npm on Windows is a .cmd shim, which requires a shell to spawn.
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function listOffenders(prefix: string, offenders: string[]): string {
  const shown = offenders.slice(0, MAX_LISTED).join(", ");
  const total = offenders.length > MAX_LISTED ? ` (${offenders.length} total)` : "";
  return `${prefix}${shown}${total}`;
}

function scanLines(files: string[], cwd: string, label: string, matchLine: (line: string) => boolean): CommandOutcome {
  if (files.length === 0) {
    return { passed: false, message: `${label}: no files provided` };
  }
  const missing: string[] = [];
  const offenders: string[] = [];
  for (const file of files) {
    const fullPath = join(cwd, file);
    if (!existsSync(fullPath)) {
      missing.push(file);
      continue;
    }
    const lines = readFileSync(fullPath, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (matchLine(line)) {
        offenders.push(`${file}:${index + 1}`);
      }
    });
  }
  if (missing.length > 0) {
    return { passed: false, message: `${label}: ${listOffenders("files not found: ", missing)}` };
  }
  if (offenders.length > 0) {
    return { passed: false, message: `${label}: ${listOffenders("found at ", offenders)}` };
  }
  return { passed: true, message: `${label}: clean across ${files.length} file(s)` };
}

function checkDocstrings(file: string, cwd: string): CommandOutcome {
  const dotIndex = file.lastIndexOf(".");
  const ext = dotIndex >= 0 ? file.slice(dotIndex).toLowerCase() : "";
  if (!DOCSTRING_EXTENSIONS.includes(ext)) {
    return { passed: true, message: `docstrings: skipped for ${file} (scanned extensions: ${DOCSTRING_EXTENSIONS.join(", ")})` };
  }
  const fullPath = join(cwd, file);
  if (!existsSync(fullPath)) {
    return { passed: false, message: `docstrings: file not found: ${file}` };
  }
  const lines = readFileSync(fullPath, "utf8").split(/\r?\n/);
  const missing: string[] = [];
  lines.forEach((line, index) => {
    if (!EXPORT_DECLARATION.test(line)) {
      return;
    }
    const lookback = lines.slice(Math.max(0, index - 3), index);
    if (!lookback.some(above => DOCSTRING_MARK.test(above))) {
      missing.push(`${file}:${index + 1}`);
    }
  });
  if (missing.length > 0) {
    return { passed: false, message: `docstrings: ${listOffenders("missing on exports at ", missing)}` };
  }
  return { passed: true, message: `docstrings: all exports documented in ${file}` };
}

/**
 * Runs the requested quality checks and reports per-check results.
 *
 * - checkLint / checkTests: run the matching package.json script via the
 *   detected package manager (bun when a bun lockfile exists, otherwise npm).
 * - checkTypecheck: run the typecheck script, falling back to the locally
 *   installed TypeScript compiler, or report a skipped check when neither
 *   exists.
 * - checkNoDebug / checkDocstrings: scan the given files line by line.
 *
 * A skipped check passes but says so explicitly in its message; only a check
 * that ran and failed turns the aggregate `pass` false.
 */
export function verifyQuality(files: string[], options: VerificationOptions = {}): VerificationResult {
  const cwd = options.cwd ?? process.cwd();
  const pkg = readPackageJson(cwd);
  const pm = packageManager(cwd);
  const details: VerificationDetail[] = [];

  const push = (criterion: string, outcome: CommandOutcome): void => {
    details.push({ criterion, passed: outcome.passed, message: outcome.message });
  };

  if (options.checkLint) {
    if (hasScript(pkg, "lint")) {
      push("lint", runCommand(pm, ["run", "lint"], cwd, process.platform === "win32"));
    }
    else {
      details.push({ criterion: "lint", passed: true, message: "lint skipped: no lint script in package.json" });
    }
  }

  if (options.checkTypecheck) {
    const tscEntry = join(cwd, "node_modules", "typescript", "bin", "tsc");
    if (hasScript(pkg, "typecheck")) {
      push("typecheck", runCommand(pm, ["run", "typecheck"], cwd, process.platform === "win32"));
    }
    else if (existsSync(tscEntry)) {
      // Executed via the current runtime instead of the .bin shim so the
      // command works without a shell even when the path contains spaces.
      push("typecheck", runCommand(process.execPath, [tscEntry, "--noEmit"], cwd, false));
    }
    else {
      details.push({ criterion: "typecheck", passed: true, message: "typecheck skipped: no typecheck script and TypeScript is not installed" });
    }
  }

  if (options.checkTests) {
    if (hasScript(pkg, "test")) {
      push("tests", runCommand(pm, ["run", "test"], cwd, process.platform === "win32"));
    }
    else {
      details.push({ criterion: "tests", passed: true, message: "tests skipped: no test script in package.json" });
    }
  }

  if (options.checkNoDebug) {
    push("no-debug-statements", scanLines(files, cwd, "debug statements", line => DEBUG_PATTERN.test(line)));
  }

  if (options.checkDocstrings) {
    if (files.length === 0) {
      details.push({ criterion: "has-docstrings", passed: false, message: "docstrings: no files provided" });
    }
    else {
      for (const file of files) {
        push("has-docstrings", checkDocstrings(file, cwd));
      }
    }
  }

  const allPassed = details.every(d => d.passed);
  return { pass: allPassed, details };
}
