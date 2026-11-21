import type { OpenCodeRunner, SessionInfo } from "../scripts/eval-collect";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { collectScenario, markdownRow } from "../scripts/eval-collect";

const PLAYGROUND = "sandbox/playground";

async function syntheticExport(): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(join(import.meta.dir, "fixtures", "synthetic-session-export.json"), "utf8")) as Record<string, unknown>;
}

function childExport(childID: string, parentID: string): Record<string, unknown> {
  return {
    info: { id: childID, parentID, agent: "build" },
    messages: [{
      type: "assistant",
      content: [{ type: "tool", name: "skill", state: { status: "completed", input: { id: "child-skill" } } }],
    }],
  };
}

function makeRunner(root: Record<string, unknown>, sessions: SessionInfo[]): OpenCodeRunner {
  const rootID = (root.info as { id: string }).id;
  const children: Record<string, Record<string, unknown>> = {
    ses_synthetic_child: childExport("ses_synthetic_child", rootID),
    ses_synthetic_legacy_child: childExport("ses_synthetic_legacy_child", rootID),
  };
  return {
    async listSessions() {
      return sessions;
    },
    async exportSession(sessionID: string) {
      if (sessionID === rootID) {
        return root;
      }
      return children[sessionID];
    },
  };
}

async function tempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "eval-collect-"));
}

describe("collectScenario", () => {
  test("exports root and children with provenance and writes a summary", async () => {
    const root = await syntheticExport();
    const rootID = (root.info as { id: string }).id;
    const outDir = await tempDir();
    const sessions: SessionInfo[] = [{ id: rootID, directory: PLAYGROUND, updated: Date.now() }];
    const summary = await collectScenario({
      scenario: 1,
      run: 1,
      playgroundDir: PLAYGROUND,
      runner: makeRunner(root, sessions),
      outDir,
    });
    expect(summary.sessionID).toBe(rootID);
    expect(summary.primaryAgent).toBe("build");
    expect(summary.childSessionCount).toBe(2);
    expect(summary.completedSkillIDs.some(record => record.source === "child")).toBe(true);
    expect(summary.completedSubagentIDs.some(record => record.source === "main")).toBe(true);
    expect(summary.failedSkillIDs.length).toBe(1);
    expect(summary.errors).toBe(1);
    expect(summary.incomplete).toBe(1);
    expect(summary.mismatch).toBe(true);
    const saved = JSON.parse(await readFile(join(outDir, "summary", "1-run1.json"), "utf8")) as typeof summary;
    expect(saved.sessionID).toBe(rootID);
    const row = markdownRow(summary);
    expect(row).toContain("| 1 Feature | 1 | build |");
    expect(row).toContain("child-skill");
    await rm(outDir, { recursive: true, force: true });
  });

  test("refuses missing, stale, and already-collected sessions, with force override", async () => {
    const root = await syntheticExport();
    const rootID = (root.info as { id: string }).id;
    const outDir = await tempDir();
    const now = Date.now();
    const base = {
      scenario: 2,
      run: 1 as const,
      playgroundDir: PLAYGROUND,
      outDir,
      now,
    };
    await expect(collectScenario({ ...base, runner: makeRunner(root, []) })).rejects.toThrow("no OpenCode session found");
    await expect(collectScenario({
      ...base,
      runner: makeRunner(root, [{ id: rootID, directory: PLAYGROUND, updated: now - 61 * 60 * 1000 }]),
    })).rejects.toThrow("older than 60 minutes");
    const runner = makeRunner(root, [{ id: rootID, directory: PLAYGROUND, updated: now }]);
    await collectScenario({ ...base, runner });
    await expect(collectScenario({ ...base, runner })).rejects.toThrow("already collected");
    const forced = await collectScenario({ ...base, runner, force: true });
    expect(forced.sessionID).toBe(rootID);
    await rm(outDir, { recursive: true, force: true });
  });

  test("rejects invalid scenario or run values", async () => {
    const root = await syntheticExport();
    const outDir = await tempDir();
    await expect(collectScenario({
      scenario: 11,
      run: 1,
      playgroundDir: PLAYGROUND,
      runner: makeRunner(root, []),
      outDir,
    })).rejects.toThrow("scenario must be an integer from 1 to 10");
    await rm(outDir, { recursive: true, force: true });
  });
});
