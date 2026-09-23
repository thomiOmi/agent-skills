import { describe, expect, test } from "bun:test";
import { decomposeTask, inferAgent } from "../skills/task-decomposition/scripts/task-decomposer";

describe("decomposeTask", () => {
  test("dependencies reference sibling step ids, not raw numbers", () => {
    const subtasks = decomposeTask("a\nb\nc");
    expect(subtasks).toHaveLength(3);
    expect(subtasks[0]?.id).toBe("step-1");
    expect(subtasks[0]?.dependencies).toEqual([]);
    expect(subtasks[1]?.dependencies).toEqual(["step-1"]);
    expect(subtasks[2]?.dependencies).toEqual(["step-2"]);
    for (const subtask of subtasks) {
      for (const dep of subtask.dependencies) {
        expect(subtasks.some(s => s.id === dep)).toBe(true);
      }
    }
  });

  test("skips empty lines without breaking id and dependency alignment", () => {
    const subtasks = decomposeTask("a\n\n   \nb\nc");
    expect(subtasks).toHaveLength(3);
    expect(subtasks[1]?.id).toBe("step-2");
    expect(subtasks[1]?.dependencies).toEqual(["step-1"]);
  });
});

describe("inferAgent", () => {
  test("maps keywords to agents", () => {
    expect(inferAgent("write tests for coverage")).toBe("qa-engineer");
    expect(inferAgent("deploy to production")).toBe("devops");
    expect(inferAgent("unrelated task")).toBe("senior-developer");
  });
});
