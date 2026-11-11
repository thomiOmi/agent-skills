import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface PlanInput {
  action: "create" | "list" | "read";
  name?: string;
  content?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function getNextPlanNumber(plansDir: string): Promise<number> {
  try {
    const files = await readdir(plansDir);
    const numbers = files
      .map((f) => {
        const match = f.match(/^(\d+)-/);
        return match ? parseInt(match[1]!, 10) : 0;
      })
      .filter(n => n > 0);
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  }
  catch {
    return 1;
  }
}

export async function handlePlan(input: PlanInput, projectDir: string): Promise<string> {
  const { action, name, content } = input;
  const plansDir = join(projectDir, ".kilo", "plans");

  if (action === "list") {
    try {
      await mkdir(plansDir, { recursive: true });
      const files = await readdir(plansDir);
      const planFiles = files
        .filter(f => f.endsWith(".md"))
        .sort();
      if (planFiles.length === 0) {
        return "No plan files found.";
      }
      return planFiles.join("\n");
    }
    catch {
      return "No plan files found.";
    }
  }

  if (action === "read") {
    if (!name) {
      return "Plan read requires a name.";
    }
    // Try exact match first, then search by name
    const exactPath = join(plansDir, `${name}.md`);
    try {
      await stat(exactPath);
      const content = await readFile(exactPath, "utf-8");
      return content;
    }
    catch {
      // Search for plan containing the name
      try {
        const files = await readdir(plansDir);
        const match = files.find(
          f => f.endsWith(".md") && f.includes(slugify(name!)),
        );
        if (match) {
          const content = await readFile(join(plansDir, match), "utf-8");
          return content;
        }
      }
      catch {
        // fall through to error
      }
      return `Plan not found: ${name}`;
    }
  }

  // action === "create"
  if (!name || !content) {
    return "Plan create requires both name and content.";
  }

  await mkdir(plansDir, { recursive: true });
  const nextNumber = await getNextPlanNumber(plansDir);
  const slug = slugify(name!);
  const fileName = `${nextNumber}-${slug}.md`;
  const filePath = join(plansDir, fileName);

  const planContent = `# Plan: ${name}

${content}

---
Created: ${new Date().toISOString()}
`;

  await writeFile(filePath, planContent, "utf-8");

  return `Plan created: ${fileName}`;
}
