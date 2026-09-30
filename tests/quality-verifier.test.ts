import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { verifyQuality } from "../skills/testing/scripts/quality-verifier";

function makeProject(files: Record<string, string>, scripts: Record<string, string> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "qv-test-"));
  for (const [path, content] of Object.entries(files)) {
    const full = join(dir, path);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, content);
  }
  if (Object.keys(scripts).length > 0) {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ scripts }));
  }
  return dir;
}

describe("verifyQuality (real verification)", () => {
  it("detects debug statements in scanned files", () => {
    const dir = makeProject({
      "src/a.ts": "export function a() {\n  console.log(\"debug\");\n}\n",
      "src/b.ts": "export function b(): number {\n  return 1;\n}\n",
    });
    try {
      const result = verifyQuality(["src/a.ts", "src/b.ts"], { checkNoDebug: true, cwd: dir });
      expect(result.pass).toBe(false);
      const detail = result.details.find(d => d.criterion === "no-debug-statements");
      expect(detail?.passed).toBe(false);
      expect(detail?.message).toContain("src/a.ts:2");
    }
    finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("passes debug scan on clean files and reports file count", () => {
    const dir = makeProject({ "src/clean.ts": "export function clean(): void {}\n" });
    try {
      const result = verifyQuality(["src/clean.ts"], { checkNoDebug: true, cwd: dir });
      expect(result.pass).toBe(true);
      const detail = result.details.find(d => d.criterion === "no-debug-statements");
      expect(detail?.passed).toBe(true);
      expect(detail?.message).toContain("1 file(s)");
    }
    finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails when a scanned file is missing", () => {
    const dir = makeProject({});
    try {
      const result = verifyQuality(["src/ghost.ts"], { checkNoDebug: true, cwd: dir });
      expect(result.pass).toBe(false);
      expect(result.details[0]?.message).toContain("files not found");
    }
    finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("runs a failing script check and reports its output", () => {
    // A script that always exits 1 simulates lint/typecheck/test failure
    // without depending on any real toolchain in the temp project.
    const script = process.platform === "win32" ? "node -e \"process.exit(1)\"" : "exit 1";
    const dir = makeProject({}, { lint: script });
    try {
      const result = verifyQuality([], { checkLint: true, cwd: dir });
      expect(result.pass).toBe(false);
      const detail = result.details.find(d => d.criterion === "lint");
      expect(detail?.passed).toBe(false);
    }
    finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("runs a passing script check", () => {
    const script = process.platform === "win32" ? "node -e \"process.exit(0)\"" : "exit 0";
    const dir = makeProject({}, { lint: script });
    try {
      const result = verifyQuality([], { checkLint: true, cwd: dir });
      expect(result.pass).toBe(true);
      const detail = result.details.find(d => d.criterion === "lint");
      expect(detail?.passed).toBe(true);
      expect(detail?.message).toContain("passed");
    }
    finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("skips script checks explicitly when the script does not exist", () => {
    const dir = makeProject({});
    try {
      const result = verifyQuality([], { checkLint: true, checkTests: true, cwd: dir });
      expect(result.pass).toBe(true);
      expect(result.details.find(d => d.criterion === "lint")?.message).toContain("skipped");
      expect(result.details.find(d => d.criterion === "tests")?.message).toContain("skipped");
    }
    finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("detects missing docstrings on exports", () => {
    const dir = makeProject({
      "src/doc.ts": "/**\n * Documented.\n */\nexport function documented(): void {}\n",
      "src/nodoc.ts": "export function undocumented(): void {}\n",
    });
    try {
      const result = verifyQuality(["src/doc.ts", "src/nodoc.ts"], { checkDocstrings: true, cwd: dir });
      expect(result.pass).toBe(false);
      const bad = result.details.find(d => d.message.includes("nodoc.ts"));
      expect(bad?.passed).toBe(false);
      expect(bad?.message).toContain("missing on exports");
      const good = result.details.find(d => d.message.includes("doc.ts") && !d.message.includes("nodoc.ts"));
      expect(good?.passed).toBe(true);
    }
    finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
