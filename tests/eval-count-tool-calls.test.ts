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
  test("splits completed and failed IDs, finds child sessions, and checks completed skill calls only", async () => {
    const result = analyzeSession(await fixture());
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.analysis.total).toBe(6);
    expect([...result.analysis.totals.entries()].sort()).toEqual([
      ["shell", 1],
      ["skill", 2],
      ["subagent", 2],
      ["task", 1],
    ]);
    expect([...result.analysis.completedSkillIds.entries()]).toEqual([["security-review", 1]]);
    expect([...result.analysis.failedSkillIds.entries()]).toEqual([["missing-skill", 1]]);
    expect([...result.analysis.completedAgentIds.entries()]).toEqual([["security-auditor", 1]]);
    expect([...result.analysis.failedAgentIds.entries()]).toEqual([]);
    expect([...result.analysis.childSessionIds.entries()].sort()).toEqual([
      ["ses_synthetic_child", 1],
      ["ses_synthetic_legacy_child", 1],
    ]);
    expect(result.analysis.errors).toBe(1);
    expect(result.analysis.incomplete).toBe(1);
    expect(result.analysis.skillMessages).toBe(1);
    expect(result.analysis.completedSkillCalls).toBe(1);
    expect(result.analysis.mismatch).toBe(false);
  });

  test("reports a mismatch when skill messages exceed completed skill calls", async () => {
    const data = await fixture();
    data.messages = [
      ...(data.messages ?? []),
      { type: "skill", skill: "extra-skill", name: "extra-skill", time: { created: 5 } },
    ];
    const result = analyzeSession(data);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.analysis.skillMessages).toBe(2);
    expect(result.analysis.completedSkillCalls).toBe(1);
    expect(result.analysis.mismatch).toBe(true);
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
  test("prints all tool names, ID groups, child sessions, and no false mismatch", async () => {
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
    expect(output).toContain("task: 1");
    expect(output).toContain("Skill IDs - completed (state.input.id):\n  security-review: 1");
    expect(output).toContain("Skill IDs - failed (state.input.id):\n  missing-skill: 1");
    expect(output).toContain("Subagent IDs - completed (state.input.agent):\n  security-auditor: 1");
    expect(output).toContain("Subagent IDs - failed (state.input.agent):\n  (none)");
    expect(output).toContain("Child sessions (state.metadata.sessionID):\n  ses_synthetic_child: 1\n  ses_synthetic_legacy_child: 1");
    expect(errors).not.toContain("MISMATCH:");
  });
});
