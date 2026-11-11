import { describe, expect, it } from "bun:test";
import { CustomToolPlugin } from "../plugin/custom-tool";

type TransformCallback = (editor: ToolEditor) => void;

interface ToolEditor {
  namespace: (ns: { name: string; description: string }) => void;
  add: (tool: ToolInfo) => void;
}

interface ToolInfo {
  name: string;
  description: string;
  input: unknown;
  options: { namespace: string; codemode: boolean };
  execute: (input: unknown, context: unknown) => Promise<{ content: string }>;
}

interface CapturedTools {
  namespace: { name: string; description: string } | null;
  tools: Record<string, ToolInfo>;
}

interface MockStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  remove: (key: string) => Promise<void>;
  scan: (options: unknown) => Promise<unknown>;
}

type PluginContext = Parameters<typeof CustomToolPlugin.setup>[0];

function createHarness(): { context: PluginContext; tools: CapturedTools } {
  const captured: CapturedTools = { namespace: null, tools: {} };

  const storageData = new Map<string, unknown>();

  const storage: MockStorage = {
    get: async (key: string) => storageData.get(key),
    set: async (key: string, value: unknown) => {
      storageData.set(key, value);
    },
    remove: async (key: string) => {
      storageData.delete(key);
    },
    scan: async (options: unknown) => {
      const opts = options as { prefix?: string };
      const prefix = opts?.prefix ?? "";
      const keys: string[] = [];
      const values: unknown[] = [];
      for (const [key, value] of storageData.entries()) {
        if (key.startsWith(prefix)) {
          keys.push(key);
          values.push(value);
        }
      }
      return { keys, values };
    },
  };

  const context: PluginContext = {
    id: "test",
    location: {
      directory: process.cwd(),
      project: { directory: process.cwd(), canonical: process.cwd() },
    } as PluginContext["location"],
    options: {} as PluginContext["options"],
    storage: storage as unknown as PluginContext["storage"],
    tool: {
      transform: async (callback: TransformCallback) => {
        const editor: ToolEditor = {
          namespace: (ns) => {
            captured.namespace = ns;
          },
          add: (tool) => {
            captured.tools[tool.name] = tool;
          },
        };
        callback(editor);
        return { dispose: async () => {} };
      },
    },
  } as unknown as PluginContext;

  return { context, tools: captured };
}

describe("Custom tool plugin", () => {
  it("registers namespace agent_skills", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    expect(tools.namespace).toEqual({
      name: "agent_skills",
      description:
        "Agent skills workflow tools for plan, todo, delegate, and memory management",
    });
  });

  it("registers four tools: plan, todo, delegate, memory", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    expect(Object.keys(tools.tools)).toEqual([
      "plan",
      "todo",
      "delegate",
      "memory",
    ]);
  });

  it("plan tool create action creates plan file", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const planTool = tools.tools.plan;
    expect(planTool).toBeDefined();

    const result = await planTool!.execute(
      { action: "create", name: "test-plan", content: "Implement feature X" },
      {} as never,
    );

    expect(result.content).toContain("Plan created");
  });

  it("todo tool add action adds todo item", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const todoTool = tools.tools.todo;
    expect(todoTool).toBeDefined();

    const result = await todoTool!.execute(
      { action: "add", item: "Write tests" },
      { sessionID: "test-session-1" } as never,
    );

    expect(result.content).toContain("Todo added: Write tests");
  });

  it("todo tool list action lists todos", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const todoTool = tools.tools.todo;
    expect(todoTool).toBeDefined();

    // Add a todo first
    await todoTool!.execute(
      { action: "add", item: "Test item" },
      { sessionID: "test-session-2" } as never,
    );

    const result = await todoTool!.execute(
      { action: "list" },
      { sessionID: "test-session-2" } as never,
    );

    expect(result.content).toContain("Test item");
  });

  it("delegate tool delegate action records delegated task", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const delegateTool = tools.tools.delegate;
    expect(delegateTool).toBeDefined();

    const result = await delegateTool!.execute(
      {
        action: "delegate",
        agentId: "frontend-developer",
        description: "Implement UI component",
        prompt: "Create a button component",
      },
      {} as never,
    );

    expect(result.content).toContain("Task delegated to frontend-developer");
  });

  it("memory tool save and recall action works", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const memoryTool = tools.tools.memory;
    expect(memoryTool).toBeDefined();

    const saveResult = await memoryTool!.execute(
      {
        action: "save",
        title: "session-id",
        summary: "abc123",
        created_by: "agent",
      },
      { sessionID: "test-session-3" } as never,
    );
    expect(saveResult.content).toContain("Memory saved: session-id");

    const recallResult = await memoryTool!.execute(
      { action: "recall", title: "session-id" },
      { sessionID: "test-session-3" } as never,
    );
    expect(recallResult.content).toBe("abc123");
  });

  it("memory tool list action lists entries", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const memoryTool = tools.tools.memory;
    expect(memoryTool).toBeDefined();

    await memoryTool!.execute(
      { action: "save", title: "entry1", summary: "First entry" },
      { sessionID: "test-session-4" } as never,
    );
    await memoryTool!.execute(
      { action: "save", title: "entry2", summary: "Second entry" },
      { sessionID: "test-session-4" } as never,
    );

    const result = await memoryTool!.execute(
      { action: "list" },
      { sessionID: "test-session-4" } as never,
    );
    expect(result.content).toContain("entry1");
    expect(result.content).toContain("entry2");
    expect(result.content).toContain("First entry");
    expect(result.content).toContain("Second entry");
  });

  it("memory tool status action shows config", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const memoryTool = tools.tools.memory;
    expect(memoryTool).toBeDefined();

    await memoryTool!.execute(
      { action: "save", title: "test", summary: "test entry" },
      { sessionID: "test-session-5" } as never,
    );

    const result = await memoryTool!.execute(
      { action: "status" },
      { sessionID: "test-session-5" } as never,
    );
    expect(result.content).toContain("Memory status:");
    expect(result.content).toContain("enabled: true");
    expect(result.content).toContain("auto: false");
    expect(result.content).toContain("entries: 1");
  });

  it("memory tool enable/disable actions work", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const memoryTool = tools.tools.memory;
    expect(memoryTool).toBeDefined();

    const enableResult = await memoryTool!.execute(
      { action: "enable" },
      { sessionID: "test-session-6" } as never,
    );
    expect(enableResult.content).toBe("Memory enabled.");

    const disableResult = await memoryTool!.execute(
      { action: "disable" },
      { sessionID: "test-session-6" } as never,
    );
    expect(disableResult.content).toBe("Memory disabled.");
  });

  it("memory tool auto action toggles auto-save", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const memoryTool = tools.tools.memory;
    expect(memoryTool).toBeDefined();

    const onResult = await memoryTool!.execute(
      { action: "auto", auto: "on" },
      { sessionID: "test-session-7" } as never,
    );
    expect(onResult.content).toBe("Memory auto-save on.");

    const offResult = await memoryTool!.execute(
      { action: "auto", auto: "off" },
      { sessionID: "test-session-7" } as never,
    );
    expect(offResult.content).toBe("Memory auto-save off.");
  });

  it("memory tool purge action requires confirm", async () => {
    const { context, tools } = createHarness();
    await CustomToolPlugin.setup(context);

    const memoryTool = tools.tools.memory;
    expect(memoryTool).toBeDefined();

    await memoryTool!.execute(
      { action: "save", title: "entry1", summary: "Entry 1" },
      { sessionID: "test-session-8" } as never,
    );

    // Without confirm, should fail
    const noConfirm = await memoryTool!.execute(
      { action: "purge" },
      { sessionID: "test-session-8" } as never,
    );
    expect(noConfirm.content).toBe("Memory purge requires confirm: true.");

    // With confirm, should purge
    const result = await memoryTool!.execute(
      { action: "purge", confirm: true },
      { sessionID: "test-session-8" } as never,
    );
    expect(result.content).toBe("Memory purged: 1 entries removed.");
  });
});
