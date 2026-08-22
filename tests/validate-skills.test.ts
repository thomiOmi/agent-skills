import { describe, expect, it } from "bun:test";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "pathe";
import parseYaml from "yaml";

describe("Validate Skills", () => {
  const skillsDir = join(import.meta.dir, "..", "skills");

  it("should have valid SKILL.md in every skill directory", async () => {
    const entries = await readdir(skillsDir);
    let count = 0;

    for (const entry of entries) {
      const fullPath = join(skillsDir, entry);
      const s = await stat(fullPath);
      if (!s.isDirectory()) continue;

      const skillFilePath = join(fullPath, "SKILL.md");
      const exists = await stat(skillFilePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      const content = await readFile(skillFilePath, "utf-8");
      expect(content.startsWith("---")).toBe(true);

      const parts = content.split("---");
      expect(parts.length).toBeGreaterThanOrEqual(3);

      const frontmatterRaw = parts[1];
      const frontmatter = parseYaml.parse(frontmatterRaw ?? "");

      expect(frontmatter).toBeDefined();
      expect(frontmatter.name).toBe(entry);
      expect(typeof frontmatter.description).toBe("string");
      expect(frontmatter.description.length).toBeGreaterThan(0);

      count++;
    }

    expect(count).toBeGreaterThanOrEqual(15);
  });
});
