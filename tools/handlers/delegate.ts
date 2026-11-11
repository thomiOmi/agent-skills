import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface DelegateInput {
  action: "delegate" | "status";
  agentId: string;
  description: string;
  prompt: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function getLatestPlanFile(plansDir: string): Promise<string | null> {
  try {
    const files = await readdir(plansDir);
    const planFiles = files
      .filter(f => f.endsWith(".md"))
      .sort()
      .reverse();
    if (planFiles.length === 0) {
      return null;
    }
    return join(plansDir, planFiles[0]!);
  }
  catch {
    return null;
  }
}

export async function handleDelegate(
  input: DelegateInput,
  projectDir: string,
): Promise<string> {
  const { action, agentId, description, prompt } = input;
  const plansDir = join(projectDir, ".kilo", "plans");

  if (action === "delegate") {
    await mkdir(plansDir, { recursive: true });

    const latestPlan = await getLatestPlanFile(plansDir);
    let filePath: string;

    if (latestPlan) {
      filePath = latestPlan;
    }
    else {
      const slug = slugify(description!);
      filePath = join(plansDir, `1-${slug}.md`);
      await writeFile(
        filePath,
        `# Plan: ${description}

## Delegated Tasks

---
`,
        "utf-8",
      );
    }

    const existing = await readFile(filePath, "utf-8");
    const timestamp = new Date().toISOString();
    const entry = `- [ ] **${description}** - ${agentId}\n  - Prompt: ${prompt}\n  - Delegated: ${timestamp}\n`;

    const delegatedMarker = "## Delegated Tasks";
    const markerIndex = existing.indexOf(delegatedMarker);
    let updated: string;

    if (markerIndex !== -1) {
      const afterMarker = existing.slice(markerIndex + delegatedMarker.length);
      const nextSection = afterMarker.indexOf("\n## ");
      const insertPos
        = nextSection !== -1
          ? markerIndex + delegatedMarker.length + nextSection
          : existing.length;
      updated
        = existing.slice(0, insertPos) + entry + existing.slice(insertPos);
    }
    else {
      updated = `${existing}\n${delegatedMarker}\n${entry}`;
    }

    await writeFile(filePath, updated, "utf-8");

    return `Task delegated to ${agentId}: ${description}`;
  }

  // action === "status"
  const planFile = await getLatestPlanFile(plansDir);
  if (!planFile) {
    return `Task not found: ${agentId} - ${description}`;
  }

  const existing = await readFile(planFile, "utf-8");
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

  await writeFile(planFile, lines.join("\n"), "utf-8");
  return `Task status updated: ${agentId} - ${description}`;
}
