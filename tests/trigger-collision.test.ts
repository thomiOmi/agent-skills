import { readdir, readFile, stat } from "node:fs/promises";
import { describe, expect, it } from "bun:test";
import { join } from "pathe";

interface SkillInfo {
  name: string;
  description: string;
}

const skillsDir = join(import.meta.dir, "..", "skills");

/**
 * Collision tests for the skill catalog.
 *
 * Routing quality depends on each skill owning a distinct trigger surface.
 * Two skills sharing an exact trigger phrase make the agent guess, wasting
 * context and producing inconsistent behavior (see DECISIONS.md: one skill
 * per agent moment; thin overlapping skills become references of the parent).
 *
 * Cross-skill pointers must be by-name only ("load `database`"), never file
 * paths, so the pointer survives restructuring.
 */

async function loadSkills(): Promise<SkillInfo[]> {
  const entries = await readdir(skillsDir);
  const skills: SkillInfo[] = [];
  for (const entry of entries) {
    const skillFilePath = join(skillsDir, entry, "SKILL.md");
    const exists = await stat(skillFilePath).then(() => true).catch(() => false);
    if (!exists) {
      continue;
    }
    const content = await readFile(skillFilePath, "utf-8");
    const frontmatterRaw = content.split("---")[1] ?? "";
    const frontmatter = Bun.YAML.parse(frontmatterRaw) as { name?: string; description?: string };
    if (typeof frontmatter.name === "string" && typeof frontmatter.description === "string") {
      skills.push({ name: frontmatter.name, description: frontmatter.description });
    }
  }
  return skills;
}

function normalizeTrigger(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/u, "")
    .trim();
}

function extractQuotedPhrases(description: string): string[] {
  return [...description.matchAll(/"([^"]+)"/g)].map(m => m[1] ?? "");
}

describe("Skill Catalog Routing Health", () => {
  it("no two skills share an identical trigger phrase", async () => {
    const skills = await loadSkills();
    expect(skills.length).toBeGreaterThan(10);

    const owner = new Map<string, string>();
    const collisions: string[] = [];

    for (const skill of skills) {
      const triggers = extractQuotedPhrases(skill.description)
        .map(normalizeTrigger)
        .filter(t => t.length > 0);
      for (const trigger of triggers) {
        const previous = owner.get(trigger);
        if (previous === undefined) {
          owner.set(trigger, skill.name);
        }
        else if (previous !== skill.name) {
          collisions.push(`"${trigger}" claimed by both ${previous} and ${skill.name}`);
        }
      }
    }

    expect(collisions, collisions.join("\n")).toEqual([]);
  });

  it("no skill repeats the same trigger phrase within its own description", async () => {
    const skills = await loadSkills();
    const duplicates: string[] = [];

    for (const skill of skills) {
      const seen = new Set<string>();
      for (const raw of extractQuotedPhrases(skill.description)) {
        const trigger = normalizeTrigger(raw);
        if (trigger.length === 0) {
          continue;
        }
        if (seen.has(trigger)) {
          duplicates.push(`${skill.name}: duplicate trigger "${trigger}"`);
        }
        seen.add(trigger);
      }
    }

    expect(duplicates, duplicates.join("\n")).toEqual([]);
  });

  it("descriptions reference other skills by name, never by file path", async () => {
    const skills = await loadSkills();
    const violations: string[] = [];
    const pathPattern = /skills\/|references\/|assets\/|SKILL\.md/i;

    for (const skill of skills) {
      if (pathPattern.test(skill.description)) {
        violations.push(`${skill.name}: description references a catalog path; point to other skills by name only`);
      }
    }

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
