import type { DelegateInput } from "../tools/handlers/delegate";
import type { MemoryInput } from "../tools/handlers/memory";
import type { PlanInput } from "../tools/handlers/plan";
import type { TodoInput } from "../tools/handlers/todo";
import { Plugin } from "@opencode/plugin";
import { z } from "zod";
import { handleDelegate } from "../tools/handlers/delegate";
import { handleMemory } from "../tools/handlers/memory";
import { handlePlan } from "../tools/handlers/plan";
import { handleTodo } from "../tools/handlers/todo";

interface CustomToolOptions {
  storage?: "project" | "global";
  paths?: {
    memory?: string;
  };
}

interface ToolStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  remove: (key: string) => Promise<void>;
  scan: (options: unknown) => Promise<unknown>;
}

export const CustomToolPlugin = Plugin.define({
  id: "agent-skills.custom-tool",
  async setup(context) {
    const options = context.options as CustomToolOptions;
    const storageMode: "project" | "global" = options.storage ?? "project";
    const pluginStorage: ToolStorage = context.storage as unknown as ToolStorage;
    const projectDir = context.location.project.directory;

    // Validate storage option
    if (storageMode !== "project" && storageMode !== "global") {
      throw new Error(
        `Invalid storage option: ${storageMode}. Must be "project" or "global".`,
      );
    }

    await context.tool.transform((editor) => {
      editor.namespace({
        name: "agent_skills",
        description:
          "Agent skills workflow tools for plan, todo, delegate, and memory management",
      });

      editor.add({
        name: "plan",
        description:
          "Create, list, or read project plan files in .kilo/plans/ (Kilo CLI style)",
        input: z.object({
          action: z.enum(["create", "list", "read"]),
          name: z.string().optional(),
          content: z.string().optional(),
        }),
        options: { namespace: "agent_skills", codemode: true },
        execute: async (input) => {
          const result = await handlePlan(input as PlanInput, projectDir);
          return { content: result };
        },
      });

      editor.add({
        name: "todo",
        description: "Add, complete, or list todo items (session-scoped)",
        input: z.object({
          action: z.enum(["add", "complete", "list"]),
          item: z.string().optional(),
        }),
        options: { namespace: "agent_skills", codemode: true },
        execute: async (input, toolCtx) => {
          const result = await handleTodo(
            input as TodoInput,
            pluginStorage,
            toolCtx.sessionID,
          );
          return { content: result };
        },
      });

      editor.add({
        name: "delegate",
        description:
          "Record a delegated task to a subagent in a plan file (delegation via built-in subagent)",
        input: z.object({
          action: z.enum(["delegate", "status"]),
          agentId: z.string(),
          description: z.string(),
          prompt: z.string(),
        }),
        options: { namespace: "agent_skills", codemode: true },
        execute: async (input) => {
          const result = await handleDelegate(input as DelegateInput, projectDir);
          return { content: result };
        },
      });

      editor.add({
        name: "memory",
        description: "Save, recall, or forget memory key-value entries",
        input: z.object({
          action: z.enum([
            "save",
            "recall",
            "forget",
            "list",
            "status",
            "enable",
            "disable",
            "auto",
            "purge",
          ]),
          title: z.string().optional(),
          summary: z.string().optional(),
          detail: z.string().optional(),
          created_by: z.enum(["user", "agent"]).optional(),
          confirm: z.boolean().optional(),
          auto: z.enum(["on", "off"]).optional(),
        }),
        options: { namespace: "agent_skills", codemode: true },
        execute: async (input, toolCtx) => {
          const result = await handleMemory(
            input as MemoryInput,
            pluginStorage,
            toolCtx.sessionID,
          );
          return { content: result };
        },
      });
    });
  },
});

export default CustomToolPlugin;
