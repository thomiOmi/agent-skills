import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { CompactionPlugin } from "../plugin/compaction";

type HookCallback = (event: never) => Promise<void>;

interface CapturedHooks {
  tool: Record<string, HookCallback>;
  shell: Record<string, HookCallback>;
  session: Record<string, HookCallback>;
}

interface HarnessLocation {
  directory: string;
  project: {
    directory: string;
    canonical: string;
  };
}

type PluginContext = Parameters<typeof CompactionPlugin.setup>[0];

function defaultLocation(): HarnessLocation {
  const directory = process.cwd();
  return {
    directory,
    project: { directory, canonical: directory },
  };
}

function createHarness(location: HarnessLocation = defaultLocation()): {
  context: PluginContext;
  hooks: CapturedHooks;
} {
  const hooks: CapturedHooks = { tool: {}, shell: {}, session: {} };
  const register = (domain: keyof CapturedHooks) => {
    return async (name: string, callback: HookCallback): Promise<{ dispose: () => Promise<void> }> => {
      hooks[domain][name] = callback;
      return { dispose: async () => {} };
    };
  };
  const context = {
    location,
    tool: { hook: register("tool") },
    shell: { hook: register("shell") },
    session: { hook: register("session") },
  } as unknown as PluginContext;
  return { context, hooks };
}

function getHook(hooks: Record<string, HookCallback>, name: string): HookCallback {
  const hook = hooks[name];
  if (!hook) {
    throw new Error(`Expected hook ${name} to be registered`);
  }
  return hook;
}

describe("Compaction plugin", () => {
  it("injects the TASKS.md continue point into the compaction system prompt", async () => {
    const projectDirectory = await mkdtemp(join(tmpdir(), "agent-skills-compaction-"));
    try {
      await writeFile(
        join(projectDirectory, "TASKS.md"),
        [
          "# Tasks",
          "",
          "## Continue Here",
          "- Finish the V2 plugin migration.",
          "",
          "## Backlog",
          "- Keep this out of the summary.",
          "",
        ].join("\n"),
        "utf-8",
      );
      const harness = createHarness({
        directory: projectDirectory,
        project: { directory: projectDirectory, canonical: projectDirectory },
      });
      await CompactionPlugin.setup(harness.context);
      const hook = getHook(harness.hooks.session, "compaction");
      const event = { system: [] as Array<{ type: "text"; text: string }> };

      await hook(event as never);

      expect(event.system).toHaveLength(1);
      expect(event.system[0]?.type).toBe("text");
      expect(event.system[0]?.text).toContain("## Project State (TASKS.md)");
      expect(event.system[0]?.text).toContain("Finish the V2 plugin migration.");
      expect(event.system[0]?.text).not.toContain("Keep this out of the summary.");
    }
    finally {
      await rm(projectDirectory, { recursive: true, force: true });
    }
  });

  it("does nothing when TASKS.md is absent", async () => {
    const projectDirectory = await mkdtemp(join(tmpdir(), "agent-skills-compaction-"));
    try {
      const harness = createHarness({
        directory: projectDirectory,
        project: { directory: projectDirectory, canonical: projectDirectory },
      });
      await CompactionPlugin.setup(harness.context);
      const hook = getHook(harness.hooks.session, "compaction");
      const event = { system: [] as Array<{ type: "text"; text: string }> };

      await hook(event as never);

      expect(event.system).toHaveLength(0);
    }
    finally {
      await rm(projectDirectory, { recursive: true, force: true });
    }
  });
});
