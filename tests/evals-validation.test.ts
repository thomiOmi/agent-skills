import { describe, expect, it } from "bun:test";
import { readFile, readdir } from "fs/promises";
import { join, resolve } from "pathe";

interface EvalCase {
  id: number
  prompt: string
  expected_output?: string
  files?: string[]
  // Plain string = case-insensitive substring match (legacy). Object form =
  // regex / case-sensitive / negated assertion (run-evals.ts Assertion type).
  assertions?: (string | Record<string, unknown>)[]
}

interface EvalsFile {
  skill_name: string
  evals: EvalCase[]
}

const casesRoot = resolve(import.meta.dir, "..", "evals", "cases");

describe("Validate Eval Case Files (centralized)", () => {
  it("validates every case file under evals/cases/", async () => {
    const entries = (await readdir(casesRoot, { withFileTypes: true }))
      .filter(e => e.isFile() && e.name.endsWith(".json") && e.name !== "evals.example.json");

    expect(entries.length, "at least one eval case file").toBeGreaterThan(0);

    for (const entry of entries) {
      const file = join(casesRoot, entry.name);
      const expectedSkill = entry.name.slice(0, -".json".length);
      const raw = await readFile(file, "utf-8");
      const evals = JSON.parse(raw) as EvalsFile;

      expect(evals.skill_name, `${file}: skill_name must match file stem`).toBe(expectedSkill);
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
            if (typeof assertion === "string") {
              expect(assertion.length, `${file}: string assertion must not be empty`).toBeGreaterThan(0);
              continue;
            }
            expect(typeof assertion, `${file}: assertion must be a string or an object`).toBe("object");
            expect(typeof assertion.text, `${file}: object assertion needs a "text" string`).toBe("string");
            expect((assertion.text as string).length, `${file}: object assertion "text" must not be empty`).toBeGreaterThan(0);
            for (const flag of ["regex", "caseSensitive", "negate"]) {
              if (assertion[flag] !== undefined) {
                expect(typeof assertion[flag], `${file}: assertion.${flag} must be a boolean`).toBe("boolean");
              }
            }
            if (assertion.regex === true) {
              try {
                new RegExp(assertion.text as string, assertion.caseSensitive ? "" : "i");
              }
              catch {
                expect.unreachable(`${file}: assertion regex "${assertion.text as string}" does not compile`);
              }
            }
          }
        }
      }
    }
  });
});
