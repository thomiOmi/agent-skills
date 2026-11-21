import type { SessionExport } from "../scripts/eval-count-tool-calls";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { analyzeSession } from "../scripts/eval-count-tool-calls";

const fixturePath = join(import.meta.dir, "fixtures", "synthetic-session-export.json");

async function fixture(): Promise<SessionExport> {
  return JSON.parse(await readFile(fixturePath, "utf-8")) as SessionExport;
}

describe("analyzeSession", () => {
  test("counts skill and subagent calls, errors, incomplete inputs, and skill-message cross-check", async () => {
    const result = analyzeSession(await fixture());
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.analysis.total).toBe(5);
    expect([...result.analysis.totals.entries()].sort()).toEqual([
      ["shell", 1],
      ["skill", 2],
      ["subagent", 2],
    ]);
    expect([...result.analysis.skillIds.entries()].sort()).toEqual([
      ["missing-skill", 1],
      ["security-review", 1],
    ]);
    expect([...result.analysis.agentIds.entries()]).toEqual([["security-auditor", 1]]);
    expect(result.analysis.errors).toBe(1);
    expect(result.analysis.incomplete).toBe(1);
    expect(result.analysis.skillMessages).toBe(1);
    expect(result.analysis.toolSkillCalls).toBe(2);
  });

  test("ignores streaming string inputs and reports no mismatch when counts agree", async () => {
    const data = await fixture();
    data.messages = [
      ...(data.messages ?? []).filter(message => message.type !== "skill"),
      { type: "skill", skill: "security-review", name: "security-review", time: { created: 5 } },
      { type: "skill", skill: "missing-skill", name: "missing-skill", time: { created: 5 } },
    ];
    const result = analyzeSession(data);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.analysis.incomplete).toBe(1);
    expect(result.analysis.skillMessages).toBe(2);
    expect(result.analysis.toolSkillCalls).toBe(2);
  });

  test("fails loudly on unexpected formats", () => {
    expect(analyzeSession({})).toEqual({
      ok: false,
      problem: "unexpected format: no messages array in export",
    });
    expect(analyzeSession({ messages: [] })).toEqual({
      ok: false,
      problem: "unexpected format: no assistant content[] found in export",
    });
    expect(analyzeSession({ messages: [{ type: "user" }] })).toEqual({
      ok: false,
      problem: "unexpected format: no assistant content[] found in export",
    });
  });

  test("fails loudly with an explicit zero-tool-call message", () => {
    expect(analyzeSession({ messages: [{ type: "assistant", content: [] }] })).toEqual({
      ok: false,
      problem: "0 tool calls found in file",
    });
    expect(analyzeSession({ messages: [{ type: "assistant", content: [{ type: "text" }] }] })).toEqual({
      ok: false,
      problem: "0 tool calls found in file",
    });
  });
});

describe("CLI", () => {
  test("prints every tool name and reports the skill-message mismatch", async () => {
    const child = Bun.spawn(["bun", "scripts/eval-count-tool-calls.ts", fixturePath], {
      cwd: join(import.meta.dir, ".."),
      stdout: "pipe",
      stderr: "pipe",
    });
    const [output, errors] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    expect(await child.exited).toBe(0);
    expect(output).toContain("shell: 1");
    expect(output).toContain("skill: 2");
    expect(output).toContain("subagent: 2");
    expect(errors).toContain("MISMATCH:");
  });
});
