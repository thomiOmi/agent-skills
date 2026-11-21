#!/usr/bin/env bun
/** Counts `skill` and `subagent` tool calls in a plain `opencode session export <id>` JSON file. Dev-only. */
import process from "node:process";

export interface ToolPart {
  type?: string;
  name?: string;
  state?: { status?: string; input?: unknown; metadata?: Record<string, unknown> };
}
export interface Message { type?: string; skill?: string; content?: ToolPart[]; name?: string; time?: unknown }
export interface SessionExport { messages?: Message[] }
export interface Analysis {
  total: number;
  totals: Map<string, number>;
  completedSkillIds: Map<string, number>;
  failedSkillIds: Map<string, number>;
  completedAgentIds: Map<string, number>;
  failedAgentIds: Map<string, number>;
  childSessionIds: Map<string, number>;
  errors: number;
  incomplete: number;
  skillMessages: number;
  completedSkillCalls: number;
  mismatch: boolean;
}
export type Result = { ok: true; analysis: Analysis } | { ok: false; problem: string };

function bump(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function idFrom(input: unknown, key: string): string | undefined {
  if (typeof input !== "object" || input === null) {
    return undefined;
  }
  const value = (input as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

/** Returns a problem string instead of zero counts when the export is missing or malformed. */
export function analyzeSession(data: SessionExport): Result {
  if (!Array.isArray(data?.messages)) {
    return { ok: false, problem: "unexpected format: no messages array in export" };
  }
  const contents = data.messages.flatMap(message => message?.type === "assistant" ? [message.content] : []);
  if (contents.length === 0 || contents.every(content => !Array.isArray(content))) {
    return { ok: false, problem: "unexpected format: no assistant content[] found in export" };
  }
  const tools = contents.flatMap(content => (content ?? []).filter(part => part?.type === "tool"));
  if (tools.length === 0) {
    return { ok: false, problem: "0 tool calls found in file" };
  }
  const analysis: Analysis = {
    total: tools.length,
    totals: new Map(),
    completedSkillIds: new Map(),
    failedSkillIds: new Map(),
    completedAgentIds: new Map(),
    failedAgentIds: new Map(),
    childSessionIds: new Map(),
    errors: 0,
    incomplete: 0,
    skillMessages: 0,
    completedSkillCalls: 0,
    mismatch: false,
  };
  for (const tool of tools) {
    const name = tool.name ?? "<unnamed>";
    const status = tool.state?.status;
    bump(analysis.totals, name);
    if (status === "error") {
      analysis.errors++;
    }
    if (status === "streaming") {
      analysis.incomplete++;
      continue;
    }
    const child = idFrom(tool.state?.metadata, "sessionID");
    if (child) {
      bump(analysis.childSessionIds, child);
    }
    if (name === "skill") {
      const id = idFrom(tool.state?.input, "id");
      if (id) {
        if (status === "completed") {
          bump(analysis.completedSkillIds, id);
        }
        else if (status === "error") {
          bump(analysis.failedSkillIds, id);
        }
      }
      if (status === "completed") {
        analysis.completedSkillCalls++;
      }
    }
    else if (name === "subagent") {
      const id = idFrom(tool.state?.input, "agent");
      if (id) {
        if (status === "completed") {
          bump(analysis.completedAgentIds, id);
        }
        else if (status === "error") {
          bump(analysis.failedAgentIds, id);
        }
      }
    }
  }
  analysis.skillMessages = data.messages.filter(message => message?.type === "skill" && typeof message.skill === "string").length;
  analysis.mismatch = analysis.skillMessages !== analysis.completedSkillCalls;
  return { ok: true, analysis };
}

function format(map: Map<string, number>): string {
  return [...map.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, count]) => `  ${key}: ${count}`).join("\n") || "  (none)";
}

if (import.meta.main) {
  const file = Bun.argv[2];
  if (!file) {
    process.stderr.write("usage: bun scripts/eval-count-tool-calls.ts <session.json>\n");
    process.exit(1);
  }
  let data: SessionExport;
  try {
    data = JSON.parse(await Bun.file(file).text()) as SessionExport;
  }
  catch (error) {
    process.stderr.write(`unexpected format: cannot parse JSON (${error instanceof Error ? error.message : String(error)})\n`);
    process.exit(1);
  }
  const result = analyzeSession(data);
  if (!result.ok) {
    process.stderr.write(`${result.problem}\n`);
    process.exit(1);
  }
  const { analysis } = result;
  const lines = [
    `File: ${file}`,
    `Total tool calls: ${analysis.total}`,
    "Totals by tool name:",
    format(analysis.totals),
    "Skill IDs - completed (state.input.id):",
    format(analysis.completedSkillIds),
    "Skill IDs - failed (state.input.id):",
    format(analysis.failedSkillIds),
    "Subagent IDs - completed (state.input.agent):",
    format(analysis.completedAgentIds),
    "Subagent IDs - failed (state.input.agent):",
    format(analysis.failedAgentIds),
    "Child sessions (state.metadata.sessionID):",
    format(analysis.childSessionIds),
    `Error-state tool entries: ${analysis.errors}`,
    `Incomplete (streaming, ignored): ${analysis.incomplete}`,
    `Skill messages (type=skill): ${analysis.skillMessages}; completed skill tool calls: ${analysis.completedSkillCalls}`,
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
  if (analysis.mismatch) {
    process.stderr.write(`MISMATCH: ${analysis.skillMessages} skill messages vs ${analysis.completedSkillCalls} completed skill tool calls\n`);
  }
  if (!analysis.totals.has("skill") && !analysis.totals.has("subagent")) {
    process.stderr.write("NOTE: no 'skill' or 'subagent' tool name found; check tool names above for a rename\n");
  }
}
