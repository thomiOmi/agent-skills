import type { Plugin } from "@opencode-ai/plugin";
import { readFile, stat } from "node:fs/promises";
import { join } from "pathe";

const MAX_CONTEXT_CHARS = 4000;

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch {
    return false;
  }
}

function extractContinueHere(content: string): string | null {
  const start = content.search(/^##\s+Continue Here\b/im);
  if (start === -1) {
    return null;
  }
  const rest = content.slice(start + 1);
  const next = rest.match(/^##\s+(?!Continue Here\b)/im);
  const section = next && next.index !== undefined ? rest.slice(0, next.index) : rest;
  return section.trim() || null;
}

function clamp(content: string): string {
  if (content.length <= MAX_CONTEXT_CHARS) {
    return content;
  }
  return `${content.slice(0, MAX_CONTEXT_CHARS)}\n... (truncated)`;
}

/**
 * Injects TASKS.md project state into the compaction prompt so that task
 * progress, decisions, and the "Continue Here" resume point survive context
 * compaction. Pairs with the Session Handoff convention in the
 * task-decomposition skill.
 */
export const CompactionPlugin: Plugin = async ({ directory, worktree }) => {
  const roots = [worktree, directory].filter((root, index, all) => {
    return Boolean(root) && all.indexOf(root) === index;
  });

  return {
    "experimental.session.compacting": async (_input, output) => {
      for (const root of roots) {
        const tasksPath = join(root, "TASKS.md");
        if (!(await exists(tasksPath))) {
          continue;
        }
        const content = await readFile(tasksPath, "utf-8");
        const continueHere = extractContinueHere(content);
        const body = clamp(continueHere ?? content);
        if (!body) {
          return;
        }
        output.context.push(
          "## Project State (TASKS.md)",
          "Preserve this state in the continuation summary:",
          "",
          body,
        );
        return;
      }
    },
  };
};
