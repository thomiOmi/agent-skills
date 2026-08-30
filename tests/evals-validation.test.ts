import { describe, expect, it } from "bun:test";
import { readdir, readFile, stat } from "fs/promises";
import { join, resolve } from "pathe";

interface EvalCase {
  id: number
  prompt: string
  expected_output?: string
  files?: string[]
  assertions?: string[]
}

interface EvalsFile {
  skill_name: string
  evals: EvalCase[]
}

const skillsRoot = resolve(import.meta.dir, "..", "skills");

describe("Validate Eval Files (agentskills.io)", () => {
  it("validates evals.json for every skill that ships one", async () => {
    const dirs = (await readdir(skillsRoot, { withFileTypes: true }))
      .filter(d => d.isDirectory());

    let checked = 0;
    for (const dir of dirs) {
      const file = join(skillsRoot, dir.name, "evals", "evals.json");
      try {
        await stat(file);
      }
      catch {
        continue;
      }

      checked++;
      const raw = await readFile(file, "utf-8");
      const evals = JSON.parse(raw) as EvalsFile;

      expect(evals.skill_name, `${file}: skill_name must match directory`).toBe(dir.name);
      expect(Array.isArray(evals.evals), `${file}: evals must be an array`).toBe(true);
      expect(evals.evals.length, `${file}: at least one eval case`).toBeGreaterThan(0);

      const ids = new Set<number>();
      for (const evalCase of evals.evals) {
        expect(typeof evalCase.id, `${file}: id must be a number`).toBe("number");
        expect(typeof evalCase.prompt, `${file}: prompt must be a string`).toBe("string");
        expect(evalCase.prompt.length, `${file}: prompt must not be empty`).toBeGreaterThan(0);
        expect(ids.has(evalCase.id), `${file}: duplicate eval id ${evalCase.id}`).toBe(false);
        ids.add(evalCase.id);
        if (evalCase.expected_output !== undefined) {
          expect(typeof evalCase.expected_output, `${file}: expected_output must be a string`).toBe("string");
        }
        if (evalCase.files !== undefined) {
          expect(Array.isArray(evalCase.files), `${file}: files must be an array`).toBe(true);
        }
        if (evalCase.assertions !== undefined) {
          expect(Array.isArray(evalCase.assertions), `${file}: assertions must be an array`).toBe(true);
          for (const assertion of evalCase.assertions) {
            expect(typeof assertion, `${file}: assertion must be a string`).toBe("string");
          }
        }
      }
    }

    expect(checked, "at least one skill ships an evals.json").toBeGreaterThan(0);
  });
});
