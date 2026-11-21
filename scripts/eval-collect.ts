#!/usr/bin/env bun
/** Collects the newest playground session and its descendants, then writes a local summary. Dev-only. */
import type { SessionExport, ToolPart } from "./eval-count-tool-calls";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { analyzeSession } from "./eval-count-tool-calls";

export interface SessionInfo {
  id: string;
  directory?: string;
  projectId?: string;
  created?: number;
  updated?: number;
  title?: string;
}
export interface OpenCodeRunner {
  listSessions: () => Promise<SessionInfo[]>;
  exportSession: (sessionID: string) => Promise<unknown>;
}
interface ExportedInfo {
  agent?: string;
  model?: { providerID?: string; modelID?: string };
  parentID?: string;
}
export interface IDRecord {
  id: string;
  source: "main" | "child";
  sessionID: string;
}
export interface CollectionSummary {
  scenario: number;
  run: 1 | 2;
  sessionID: string;
  primaryAgent?: string;
  model?: string;
  childSessionCount: number;
  completedSkillIDs: IDRecord[];
  failedSkillIDs: IDRecord[];
  completedSubagentIDs: IDRecord[];
  failedSubagentIDs: IDRecord[];
  errors: number;
  incomplete: number;
  mismatch: boolean;
  failures: Array<{ sessionID: string; problem: string }>;
}
export interface CollectOptions {
  scenario: number;
  run: 1 | 2;
  playgroundDir: string;
  runner: OpenCodeRunner;
  outDir?: string;
  now?: number;
  force?: boolean;
}

const DEFAULT_OUT_DIR = join(import.meta.dir, "..", "docs", "eval", "sessions");
const MAX_AGE_MS = 60 * 60 * 1000;
const SCENARIO_LABELS = [
  "Feature",
  "Bug investigation",
  "Refactor",
  "Git commit",
  "Docs",
  "DB schema",
  "Frontend",
  "Security review",
  "Tests",
  "Trivial control",
];

function normalizeDirectory(value: string): string {
  return value.replaceAll("\\", "/").toLowerCase();
}

function sessionTime(session: SessionInfo): number | undefined {
  return typeof session.updated === "number" ? session.updated : session.created;
}

function childIDs(exported: unknown): string[] {
  const data = exported as SessionExport;
  const parts: ToolPart[] = [];
  for (const message of data?.messages ?? []) {
    for (const part of message?.content ?? []) {
      if (part?.type === "tool") {
        parts.push(part);
      }
    }
  }
  const found: string[] = [];
  for (const part of parts) {
    const metadata = part.state?.metadata;
    const id = metadata?.sessionID ?? metadata?.sessionId;
    if (typeof id === "string" && !found.includes(id)) {
      found.push(id);
    }
  }
  return found;
}

function recordsFor(analysis: ReturnType<typeof analyzeSession>, sessionID: string, source: "main" | "child"): {
  completedSkillIDs: IDRecord[];
  failedSkillIDs: IDRecord[];
  completedSubagentIDs: IDRecord[];
  failedSubagentIDs: IDRecord[];
} {
  const empty = { completedSkillIDs: [], failedSkillIDs: [], completedSubagentIDs: [], failedSubagentIDs: [] };
  if (!analysis.ok) {
    return empty;
  }
  const toRecords = (map: Map<string, number>): IDRecord[] => [...map.keys()].map(id => ({ id, source, sessionID }));
  return {
    completedSkillIDs: toRecords(analysis.analysis.completedSkillIds),
    failedSkillIDs: toRecords(analysis.analysis.failedSkillIds),
    completedSubagentIDs: toRecords(analysis.analysis.completedAgentIds),
    failedSubagentIDs: toRecords(analysis.analysis.failedAgentIds),
  };
}

/** Selects a fresh root session, exports it and its descendants, and returns the written summary. */
export async function collectScenario(options: CollectOptions): Promise<CollectionSummary> {
  if (!Number.isInteger(options.scenario) || options.scenario < 1 || options.scenario > 10) {
    throw new Error("scenario must be an integer from 1 to 10");
  }
  if (options.run !== 1 && options.run !== 2) {
    throw new Error("run must be 1 or 2");
  }
  if (!options.playgroundDir) {
    throw new Error("missing playground directory: pass --playground <dir> or set EVAL_PLAYGROUND_DIR");
  }
  const outDir = options.outDir ?? DEFAULT_OUT_DIR;
  const summaryDir = join(outDir, "summary");
  const summaryPath = join(summaryDir, `${options.scenario}-run${options.run}.json`);
  const wanted = normalizeDirectory(options.playgroundDir);
  const sessions = await options.runner.listSessions();
  const candidates = sessions
    .filter(session => typeof session.directory === "string" && normalizeDirectory(session.directory) === wanted)
    .sort((left, right) => (sessionTime(right) ?? 0) - (sessionTime(left) ?? 0));
  const root = candidates[0];
  if (!root) {
    throw new Error("no OpenCode session found for the playground directory");
  }
  const timestamp = sessionTime(root);
  const now = options.now ?? Date.now();
  if (typeof timestamp !== "number" || now - timestamp > MAX_AGE_MS) {
    throw new Error("newest playground session is older than 60 minutes");
  }
  if (!options.force) {
    try {
      const previous = JSON.parse(await readFile(summaryPath, "utf8")) as CollectionSummary;
      if (previous.sessionID === root.id) {
        throw new Error("this session was already collected; pass --force to overwrite");
      }
    }
    catch (error) {
      if (error instanceof Error && error.message.startsWith("this session was already collected")) {
        throw error;
      }
    }
  }

  const baseName = `${options.scenario}-run${options.run}`;
  const summary: CollectionSummary = {
    scenario: options.scenario,
    run: options.run,
    sessionID: root.id,
    childSessionCount: 0,
    completedSkillIDs: [],
    failedSkillIDs: [],
    completedSubagentIDs: [],
    failedSubagentIDs: [],
    errors: 0,
    incomplete: 0,
    mismatch: false,
    failures: [],
  };
  const exportedRoot = await options.runner.exportSession(root.id);
  await writeFile(join(outDir, `${baseName}-${root.id}.json`), JSON.stringify(exportedRoot, null, 2));
  const rootInfo = (exportedRoot as { info?: ExportedInfo }).info;
  summary.primaryAgent = rootInfo?.agent;
  if (rootInfo?.model?.providerID && rootInfo.model.modelID) {
    summary.model = `${rootInfo.model.providerID}/${rootInfo.model.modelID}`;
  }

  const queue: Array<{ id: string; parentID: string }> = childIDs(exportedRoot).map(id => ({ id, parentID: root.id }));
  const seen = new Set<string>([root.id]);
  const analyses: Array<{ result: ReturnType<typeof analyzeSession>; sessionID: string; source: "main" | "child" }> = [];
  analyses.push({ result: analyzeSession(exportedRoot as SessionExport), sessionID: root.id, source: "main" });
  while (queue.length > 0) {
    const next = queue.shift()!;
    if (seen.has(next.id)) {
      continue;
    }
    seen.add(next.id);
    const child = await options.runner.exportSession(next.id);
    const childInfo = (child as { info?: { parentID?: string } }).info;
    if (childInfo?.parentID && childInfo.parentID !== next.parentID) {
      throw new Error("exported session is not a descendant of the collected root");
    }
    await writeFile(join(outDir, `${baseName}-child-${next.id}.json`), JSON.stringify(child, null, 2));
    summary.childSessionCount++;
    analyses.push({ result: analyzeSession(child as SessionExport), sessionID: next.id, source: "child" });
    for (const id of childIDs(child)) {
      if (!seen.has(id)) {
        queue.push({ id, parentID: next.id });
      }
    }
  }

  for (const item of analyses) {
    const found = recordsFor(item.result, item.sessionID, item.source);
    summary.completedSkillIDs.push(...found.completedSkillIDs);
    summary.failedSkillIDs.push(...found.failedSkillIDs);
    summary.completedSubagentIDs.push(...found.completedSubagentIDs);
    summary.failedSubagentIDs.push(...found.failedSubagentIDs);
    if (!item.result.ok) {
      summary.failures.push({ sessionID: item.sessionID, problem: item.result.problem });
      continue;
    }
    summary.errors += item.result.analysis.errors;
    summary.incomplete += item.result.analysis.incomplete;
    summary.mismatch ||= item.result.analysis.mismatch;
  }

  await mkdir(summaryDir, { recursive: true });
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`${markdownRow(summary)}\n`);
  return summary;
}

function joinedIDs(records: IDRecord[]): string {
  return [...new Set(records.map(record => record.id))].sort().join(", ") || "none";
}

/** Formats one results-table row for docs/eval/baseline.md. */
export function markdownRow(summary: CollectionSummary): string {
  const label = SCENARIO_LABELS[summary.scenario - 1] ?? "unknown";
  const failed = joinedIDs([...summary.failedSkillIDs, ...summary.failedSubagentIDs]);
  const notes = `mismatch=${summary.mismatch}; errors=${summary.errors}; incomplete=${summary.incomplete}${summary.failures.length ? `; failures=${summary.failures.length}` : ""}`;
  return `| ${summary.scenario} ${label} | ${summary.run} | ${summary.primaryAgent ?? "unknown"} | ${summary.sessionID} | ${joinedIDs(summary.completedSkillIDs)} | ${joinedIDs(summary.completedSubagentIDs)} | ${failed} | ${summary.childSessionCount > 0 ? "yes" : "no"} | ${notes} |`;
}

/** Creates a real OpenCode runner using the CLI. */
export function createCliRunner(): OpenCodeRunner {
  async function invoke(args: string[]): Promise<string> {
    const child = Bun.spawn(["opencode", ...args], { stdout: "pipe", stderr: "pipe" });
    const [output, errors] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    const code = await child.exited;
    if (code !== 0) {
      throw new Error(`opencode ${args.join(" ")} failed: ${errors.trim()}`);
    }
    return output;
  }
  return {
    async listSessions() {
      return JSON.parse(await invoke(["session", "list", "--format", "json"])) as SessionInfo[];
    },
    async exportSession(sessionID: string) {
      return JSON.parse(await invoke(["session", "export", sessionID]));
    },
  };
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const scenario = Number(args[0]);
  const run = Number(args[1]);
  const playgroundIndex = args.indexOf("--playground");
  const playgroundDir = playgroundIndex >= 0 ? args[playgroundIndex + 1] : Bun.env.EVAL_PLAYGROUND_DIR;
  const force = args.includes("--force");
  if (!playgroundDir) {
    process.stderr.write("usage: bun scripts/eval-collect.ts <scenario 1-10> <run 1|2> --playground <dir> [--force]\n");
    process.exit(1);
  }
  collectScenario({
    scenario,
    run: run as 1 | 2,
    playgroundDir,
    runner: createCliRunner(),
    force,
  }).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
}
