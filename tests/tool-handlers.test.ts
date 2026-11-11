import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { handleDelegate } from "../tools/handlers/delegate";
import { handleMemory } from "../tools/handlers/memory";
import { handlePlan } from "../tools/handlers/plan";
import { handleTodo } from "../tools/handlers/todo";

async function tempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agent-skills-tools-"));
}

function mockStorage(): {
  storage: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    remove: (key: string) => Promise<void>;
    scan: (options: unknown) => Promise<unknown>;
  };
  data: Map<string, unknown>;
} {
  const data = new Map<string, unknown>();
  return {
    data,
    storage: {
      get: async (key: string) => data.get(key),
      set: async (key: string, value: unknown) => {
        data.set(key, value);
      },
      remove: async (key: string) => {
        data.delete(key);
      },
      scan: async (options: unknown) => {
        const opts = options as { prefix?: string };
        const prefix = opts?.prefix ?? "";
        const keys: string[] = [];
        const values: unknown[] = [];
        for (const [key, value] of data.entries()) {
          if (key.startsWith(prefix)) {
            keys.push(key);
            values.push(value);
          }
        }
        return { keys, values };
      },
    },
  };
}

describe("Plan handler", () => {
  it("creates plan file in .kilo/plans/ on create action", async () => {
    const dir = await tempDir();
    try {
      const projectDir = join(dir, "project");
      const result = await handlePlan(
        { action: "create", name: "feature-x", content: "Implement feature X" },
        projectDir,
      );

      expect(result).toContain("Plan created");
      expect(result).toContain("1-feature-x.md");

      const planDir = join(projectDir, ".kilo", "plans");
      const files = await readdir(planDir);
      expect(files).toContain("1-feature-x.md");

      const content = await readFile(join(planDir, "1-feature-x.md"), "utf-8");
      expect(content).toContain("# Plan: feature-x");
      expect(content).toContain("Implement feature X");
    }
    finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("lists plan files", async () => {
    const dir = await tempDir();
    try {
      const projectDir = join(dir, "project");
      const planDir = join(projectDir, ".kilo", "plans");
      await mkdir(planDir, { recursive: true });
      await writeFile(
        join(planDir, "1-first.md"),
        "# Plan: first\n",
        "utf-8",
      );
      await writeFile(
        join(planDir, "2-second.md"),
        "# Plan: second\n",
        "utf-8",
      );

      const result = await handlePlan({ action: "list" }, projectDir);

      expect(result).toContain("1-first.md");
      expect(result).toContain("2-second.md");
    }
    finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("reads a plan file by name", async () => {
    const dir = await tempDir();
    try {
      const projectDir = join(dir, "project");
      const planDir = join(projectDir, ".kilo", "plans");
      await mkdir(planDir, { recursive: true });
      await writeFile(
        join(planDir, "1-feature-x.md"),
        "# Plan: feature-x\n\nImplement feature X\n",
        "utf-8",
      );

      const result = await handlePlan(
        { action: "read", name: "feature-x" },
        projectDir,
      );

      expect(result).toContain("# Plan: feature-x");
      expect(result).toContain("Implement feature X");
    }
    finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("returns error when plan not found", async () => {
    const dir = await tempDir();
    try {
      const projectDir = join(dir, "project");
      const result = await handlePlan(
        { action: "read", name: "nonexistent" },
        projectDir,
      );
      expect(result).toContain("Plan not found");
    }
    finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("Todo handler", () => {
  it("adds todo item", async () => {
    const { storage, data } = mockStorage();
    const sessionID = "test-session-1";

    const result = await handleTodo(
      { action: "add", item: "Write unit tests" },
      storage,
      sessionID,
    );

    expect(result).toContain("Todo added: Write unit tests");
    const stored = data.get(`todo:${sessionID}`);
    expect(Array.isArray(stored) && stored.includes("Write unit tests")).toBe(
      true,
    );
  });

  it("completes todo item", async () => {
    const { storage, data } = mockStorage();
    const sessionID = "test-session-2";

    data.set(`todo:${sessionID}`, ["Write unit tests", "Fix bug"]);

    const result = await handleTodo(
      { action: "complete", item: "Write unit tests" },
      storage,
      sessionID,
    );

    expect(result).toContain("Todo completed: Write unit tests");
    const stored = data.get(`todo:${sessionID}`);
    expect(Array.isArray(stored) && !stored.includes("Write unit tests")).toBe(
      true,
    );
    expect(Array.isArray(stored) && stored.includes("Fix bug")).toBe(true);
  });

  it("lists todos", async () => {
    const { storage, data } = mockStorage();
    const sessionID = "test-session-3";

    data.set(`todo:${sessionID}`, ["Task A", "Task B"]);

    const result = await handleTodo(
      { action: "list", item: "" },
      storage,
      sessionID,
    );

    expect(result).toContain("Task A");
    expect(result).toContain("Task B");
  });

  it("returns empty when no todos", async () => {
    const { storage } = mockStorage();
    const result = await handleTodo(
      { action: "list" },
      storage,
      "empty-session",
    );
    expect(result).toBe("No todos found.");
  });
});

describe("Delegate handler", () => {
  it("delegates task to agent", async () => {
    const dir = await tempDir();
    try {
      const projectDir = join(dir, "project");

      const result = await handleDelegate(
        {
          action: "delegate",
          agentId: "frontend-developer",
          description: "Implement button component",
          prompt: "Create a reusable button",
        },
        projectDir,
      );

      expect(result).toContain("Task delegated to frontend-developer");

      const planDir = join(projectDir, ".kilo", "plans");
      const files = await readdir(planDir);
      expect(files.length).toBeGreaterThan(0);

      const content = await readFile(
        join(planDir, files[0]!),
        "utf-8",
      );
      expect(content).toContain("frontend-developer");
      expect(content).toContain("Implement button component");
    }
    finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("updates task status", async () => {
    const dir = await tempDir();
    try {
      const projectDir = join(dir, "project");
      const planDir = join(projectDir, ".kilo", "plans");
      await mkdir(planDir, { recursive: true });
      await writeFile(
        join(planDir, "1-test.md"),
        "# Plan: test\n\n## Delegated Tasks\n\n- [ ] **Implement button** - frontend-developer\n",
        "utf-8",
      );

      const result = await handleDelegate(
        {
          action: "status",
          agentId: "frontend-developer",
          description: "Implement button",
          prompt: "Create a button",
        },
        projectDir,
      );

      expect(result).toContain("Task status updated");

      const content = await readFile(join(planDir, "1-test.md"), "utf-8");
      expect(content).toContain("- [x]");
    }
    finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("Memory handler", () => {
  it("saves and recalls memory entry with default created_by", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-1";

    const saveResult = await handleMemory(
      {
        action: "save",
        title: "session-id",
        summary: "abc123",
      },
      storage,
      sessionID,
    );
    expect(saveResult).toContain("Memory saved: session-id");

    const recallResult = await handleMemory(
      { action: "recall", title: "session-id" },
      storage,
      sessionID,
    );
    expect(recallResult).toBe("abc123");

    // Verify metadata stored with default created_by
    const raw = await storage.get(`memory:${sessionID}:session-id`);
    expect(raw).toMatchObject({
      title: "session-id",
      summary: "abc123",
      created_by: "agent",
      created_at: expect.any(String),
    });
  });

  it("saves memory entry with custom created_by user", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-2";

    const result = await handleMemory(
      {
        action: "save",
        title: "db-host",
        summary: "localhost",
        detail: "PostgreSQL on port 5432",
        created_by: "user",
      },
      storage,
      sessionID,
    );
    expect(result).toContain("Memory saved: db-host");

    const raw = await storage.get(`memory:${sessionID}:db-host`);
    expect(raw).toMatchObject({
      title: "db-host",
      summary: "localhost",
      detail: "PostgreSQL on port 5432",
      created_by: "user",
      created_at: expect.any(String),
    });
  });

  it("updates memory entry overwrites summary and updated_at", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-4";

    await handleMemory(
      {
        action: "save",
        title: "config-key",
        summary: "old-value",
        created_by: "agent",
      },
      storage,
      sessionID,
    );

    const updateResult = await handleMemory(
      {
        action: "save",
        title: "config-key",
        summary: "new-value",
        created_by: "user",
      },
      storage,
      sessionID,
    );
    expect(updateResult).toContain("Memory saved: config-key");

    const raw = await storage.get(`memory:${sessionID}:config-key`);
    expect(raw).toMatchObject({
      title: "config-key",
      summary: "new-value",
      created_by: "agent", // preserved from original
      updated_at: expect.any(String),
    });
  });

  it("forgets memory entry", async () => {
    const { storage, data } = mockStorage();
    const sessionID = "test-session-5";
    data.set(`memory:${sessionID}:session-id`, {
      title: "session-id",
      summary: "abc123",
      created_by: "agent",
      created_at: new Date().toISOString(),
    });

    const result = await handleMemory(
      { action: "forget", title: "session-id" },
      storage,
      sessionID,
    );
    expect(result).toContain("Memory forgotten: session-id");

    const recallResult = await handleMemory(
      { action: "recall", title: "session-id" },
      storage,
      sessionID,
    );
    expect(recallResult).toBe("Memory not found: session-id");
  });

  it("returns not found for recall when no entry exists", async () => {
    const { storage } = mockStorage();
    const result = await handleMemory(
      { action: "recall", title: "nonexistent" },
      storage,
      "empty-session",
    );
    expect(result).toBe("Memory not found: nonexistent");
  });

  it("lists memory entries", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-6";

    await handleMemory(
      { action: "save", title: "first", summary: "First entry" },
      storage,
      sessionID,
    );
    await handleMemory(
      { action: "save", title: "second", summary: "Second entry" },
      storage,
      sessionID,
    );

    const result = await handleMemory(
      { action: "list" },
      storage,
      sessionID,
    );
    expect(result).toContain("first");
    expect(result).toContain("second");
    expect(result).toContain("First entry");
    expect(result).toContain("Second entry");
  });

  it("lists memory entries empty when none exist", async () => {
    const { storage } = mockStorage();
    const result = await handleMemory(
      { action: "list" },
      storage,
      "empty-session",
    );
    expect(result).toBe("No memory entries found.");
  });

  it("shows memory status", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-7";

    await handleMemory(
      { action: "save", title: "test", summary: "test entry" },
      storage,
      sessionID,
    );

    const result = await handleMemory(
      { action: "status" },
      storage,
      sessionID,
    );
    expect(result).toContain("Memory status:");
    expect(result).toContain("enabled: true");
    expect(result).toContain("auto: false");
    expect(result).toContain("entries: 1");
  });

  it("enables memory", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-8";

    const result = await handleMemory(
      { action: "enable" },
      storage,
      sessionID,
    );
    expect(result).toBe("Memory enabled.");

    const config = await storage.get(`memory:config:${sessionID}`);
    expect(config).toMatchObject({ enabled: true });
  });

  it("disables memory", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-9";

    await handleMemory(
      { action: "enable" },
      storage,
      sessionID,
    );
    const result = await handleMemory(
      { action: "disable" },
      storage,
      sessionID,
    );
    expect(result).toBe("Memory disabled.");

    const config = await storage.get(`memory:config:${sessionID}`);
    expect(config).toMatchObject({ enabled: false });
  });

  it("turns auto-save on and off", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-10";

    const onResult = await handleMemory(
      { action: "auto", auto: "on" },
      storage,
      sessionID,
    );
    expect(onResult).toBe("Memory auto-save on.");

    const offResult = await handleMemory(
      { action: "auto", auto: "off" },
      storage,
      sessionID,
    );
    expect(offResult).toBe("Memory auto-save off.");

    const config = await storage.get(`memory:config:${sessionID}`);
    expect(config).toMatchObject({ auto: false });
  });

  it("purges memory entries with confirm", async () => {
    const { storage } = mockStorage();
    const sessionID = "test-session-11";

    await handleMemory(
      { action: "save", title: "entry1", summary: "Entry 1" },
      storage,
      sessionID,
    );
    await handleMemory(
      { action: "save", title: "entry2", summary: "Entry 2" },
      storage,
      sessionID,
    );

    // Without confirm, should fail
    const noConfirm = await handleMemory(
      { action: "purge" },
      storage,
      sessionID,
    );
    expect(noConfirm).toBe("Memory purge requires confirm: true.");

    // With confirm, should purge
    const result = await handleMemory(
      { action: "purge", confirm: true },
      storage,
      sessionID,
    );
    expect(result).toBe("Memory purged: 2 entries removed.");

    const listResult = await handleMemory(
      { action: "list" },
      storage,
      sessionID,
    );
    expect(listResult).toBe("No memory entries found.");
  });
});
