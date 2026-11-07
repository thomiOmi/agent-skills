import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

export interface TaskInput {
  action: "delegate" | "status";
  agentId: string;
  description: string;
  prompt: string;
}

export async function handleTask(input: TaskInput, tasksPath: string): Promise<string> {
  const { action, agentId, description, prompt } = input;

  let existing = "";
  try {
    await stat(tasksPath);
    existing = await readFile(tasksPath, "utf-8");
  }
  catch {
    existing = `# Tasks

## Active / In Progress

## Backlog

## Done
`;
  }

  if (action === "delegate") {
    const updated = addDelegatedTask(existing, agentId, description, prompt);
    await ensureDir(tasksPath);
    await writeFile(tasksPath, updated, "utf-8");
    return `Task delegated to ${agentId}: ${description}`;
  }

  const updated = updateTaskStatus(existing, agentId, description);
  await ensureDir(tasksPath);
  await writeFile(tasksPath, updated, "utf-8");
  return `Task status updated: ${agentId} - ${description}`;
}

function addDelegatedTask(existing: string, agentId: string, description: string, prompt: string): string {
  const lines = existing.split("\n");
  const activeIndex = lines.findIndex(line => /^##\s+Active\s*\/\s*In Progress\b/i.test(line));
  const backlogIndex = lines.findIndex(line => /^##\s+Backlog\b/i.test(line));

  const insertAt = backlogIndex !== -1 ? backlogIndex : activeIndex !== -1 ? activeIndex + 1 : lines.length;

  lines.splice(insertAt, 0, `  - [ ] **${description}** - ${agentId}`);
  lines.splice(insertAt + 1, 0, `    - Prompt: ${prompt}`);

  return lines.join("\n");
}

function updateTaskStatus(existing: string, agentId: string, description: string): string {
  const lines = existing.split("\n");
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      continue;
    }
    if (line.includes(agentId) && line.includes(description)) {
      lines[i] = line.replace("- [ ]", "- [x]");
      found = true;
      break;
    }
  }

  if (!found) {
    return `Task not found: ${agentId} - ${description}`;
  }

  return lines.join("\n");
}
