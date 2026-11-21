#!/usr/bin/env bun
/** Counts `skill` and `subagent` tool calls in a plain `opencode session export <id>` JSON file. Dev-only. */
import process from "node:process";

export interface ToolPart { type?: string; name?: string; state?: { status?: string; input?: unknown } }
export interface Message { type?: string; skill?: string; content?: ToolPart[]; name?: string; time?: unknown }
export interface SessionExport { messages?: Message[] }
export interface Analysis {
  total: number;
  totals: Map<string, number>;
  skillIds: Map<string, number>;
  agentIds: Map<string, number>;
  errors: number;
  incomplete: number;
  skillMessages: number;
  toolSkillCalls: number;
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
    skillIds: new Map(),
    agentIds: new Map(),
    errors: 0,
    incomplete: 0,
    skillMessages: 0,
    toolSkillCalls: 0,
  };
  for (const tool of tools) {
    const name = tool.name ?? "<unnamed>";
    bump(analysis.totals, name);
    if (tool.state?.status === "error") {
      analysis.errors++;
    }
    if (tool.state?.status === "streaming") {
      analysis.incomplete++;
      continue;
    }
    if (name === "skill") {
      const id = idFrom(tool.state?.input, "id");
      if (id) {
        bump(analysis.skillIds, id);
      }
    }
    else if (name === "subagent") {
      const id = idFrom(tool.state?.input, "agent");
      if (id) {
        bump(analysis.agentIds, id);
      }
    }
  }
  analysis.toolSkillCalls = analysis.totals.get("skill") ?? 0;
  analysis.skillMessages = data.messages.filter(message => message?.type === "skill" && typeof message.skill === "string").length;
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
    "Skill IDs (state.input.id):",
    format(analysis.skillIds),
    "Subagent IDs (state.input.agent):",
    format(analysis.agentIds),
    `Error-state tool entries: ${analysis.errors}`,
    `Incomplete (streaming, ignored): ${analysis.incomplete}`,
    `Skill messages (type=skill): ${analysis.skillMessages}; skill tool calls: ${analysis.toolSkillCalls}`,
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
  if (analysis.skillMessages !== analysis.toolSkillCalls) {
    process.stderr.write(`MISMATCH: ${analysis.skillMessages} skill messages vs ${analysis.toolSkillCalls} skill tool calls\n`);
  }
  if (!analysis.totals.has("skill") && !analysis.totals.has("subagent")) {
    process.stderr.write("NOTE: no 'skill' or 'subagent' tool name found; check tool names above for a rename\n");
  }
}
