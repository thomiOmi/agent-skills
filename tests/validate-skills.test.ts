import { readdir, readFile, stat } from "node:fs/promises";
import { describe, expect, it } from "bun:test";
import { join } from "pathe";
import parseYaml from "yaml";

describe("Validate Skills (Agent Skills Specification)", () => {
  const skillsDir = join(import.meta.dir, "..", "skills");
  const nameRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const allowedFrontmatterKeys = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
  ]);

  it("should validate all skills against agentskills.io specification", async () => {
    const entries = await readdir(skillsDir);
    let validSkillCount = 0;
    let totalRefCount = 0;

    for (const entry of entries) {
      const skillDirPath = join(skillsDir, entry);
      const s = await stat(skillDirPath);
      if (!s.isDirectory()) {
        continue;
      }

      // 1. Directory & SKILL.md Existence
      const skillFilePath = join(skillDirPath, "SKILL.md");
      const exists = await stat(skillFilePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      const content = await readFile(skillFilePath, "utf-8");
      expect(content.startsWith("---")).toBe(true);

      const parts = content.split("---");
      expect(parts.length).toBeGreaterThanOrEqual(3);

      const frontmatterRaw = parts[1] ?? "";
      const frontmatter = parseYaml.parse(frontmatterRaw);

      expect(frontmatter).toBeDefined();

      // 2. Validate Frontmatter Keys
      const keys = Object.keys(frontmatter);
      for (const key of keys) {
        expect(allowedFrontmatterKeys.has(key)).toBe(true);
      }

      // 3. Validate 'name' field
      expect(typeof frontmatter.name).toBe("string");
      expect(frontmatter.name).toBe(entry);
      expect(frontmatter.name.length).toBeGreaterThanOrEqual(1);
      expect(frontmatter.name.length).toBeLessThanOrEqual(64);
      expect(nameRegex.test(frontmatter.name)).toBe(true);

      // 4. Validate 'description' field
      expect(typeof frontmatter.description).toBe("string");
      expect(frontmatter.description.length).toBeGreaterThanOrEqual(1);
      expect(frontmatter.description.length).toBeLessThanOrEqual(1024);

      // 5. Validate optional 'compatibility' field
      if (frontmatter.compatibility !== undefined) {
        expect(typeof frontmatter.compatibility).toBe("string");
        expect(frontmatter.compatibility.length).toBeLessThanOrEqual(500);
      }

      // 6. Validate optional 'metadata' field
      if (frontmatter.metadata !== undefined) {
        expect(typeof frontmatter.metadata).toBe("object");
        expect(frontmatter.metadata).not.toBeNull();
      }

      // 7. Validate progressive disclosure (body line count <= 500 lines)
      const bodyLines = parts.slice(2).join("---").split("\n");
      expect(bodyLines.length).toBeLessThanOrEqual(500);

      // 8. Validate internal references point to files that actually exist
      const refMatches = [...content.matchAll(/`((?:references|assets)\/[\w.-]+\.md)`/g)];
      totalRefCount += refMatches.length;

      for (const match of refMatches) {
        const refRel = match[1] ?? "";
        const refPath = join(skillDirPath, refRel);
        const refExists = await stat(refPath).then(() => true).catch(() => false);
        expect(refExists).toBe(true);
      }

      validSkillCount++;
    }

    expect(validSkillCount).toBeGreaterThanOrEqual(15);
    expect(totalRefCount).toBeGreaterThan(0);
  });
});
