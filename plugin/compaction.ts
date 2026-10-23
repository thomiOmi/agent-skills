import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { Plugin } from "@opencode/plugin";

const MAX_CONTEXT_CHARS = 4000;

/**
 * Checks whether a path exists without throwing for missing files.
 */
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  }
  catch {
    return false;
  }
}

/**
 * Extracts the "Continue Here" section from TASKS.md so the compaction prompt
 * carries the resume point instead of the entire backlog.
 */
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

/**
 * Truncates injected context so a large TASKS.md cannot crowd out the
 * transcript being compacted.
 */
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
export const CompactionPlugin = Plugin.define({
  id: "agent-skills.compaction",
  async setup(context) {
    const roots = [
      context.location.project.directory,
      context.location.directory,
      context.location.project.canonical,
    ].filter((root, index, all) => all.indexOf(root) === index);

    await context.session.hook("compaction", async (event) => {
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
        event.system.push({
          type: "text",
          text: [
            "## Project State (TASKS.md)",
            "Preserve this state in the continuation summary:",
            "",
            body,
          ].join("\n"),
        });
        return;
      }
    });
  },
});

export default CompactionPlugin;
