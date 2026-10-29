import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { CompactionPlugin } from "../plugin/compaction";
import { guardToolCall, scanForSecrets, SecretsScannerPlugin } from "../plugin/secrets-scanner";
import { findDangerousCommand, guardBashCommand, ToolGuardianPlugin } from "../plugin/tool-guardian";

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

type PluginContext = Parameters<typeof SecretsScannerPlugin.setup>[0];

function defaultLocation(): HarnessLocation {
  const directory = process.cwd();
  return {
    directory,
    project: { directory, canonical: directory },
  };
}

/**
 * Runs a callback with an environment variable set, restoring the previous
 * value (or deleting the variable) when the callback settles.
 */
async function withEnvVar(
  name: string,
  value: string,
  callback: () => Promise<void>,
): Promise<void> {
  const previous = process.env[name];
  process.env[name] = value;
  try {
    await callback();
  }
  finally {
    if (previous === undefined) {
      delete process.env[name];
    }
    else {
      process.env[name] = previous;
    }
  }
}

/**
 * Builds a minimal V2 plugin context that records registered hooks so tests
 * can invoke them directly.
 */
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

/**
 * Returns a registered hook or fails loudly when setup did not register it.
 */
function getHook(hooks: Record<string, HookCallback>, name: string): HookCallback {
  const hook = hooks[name];
  if (!hook) {
    throw new Error(`Expected hook ${name} to be registered`);
  }
  return hook;
}

describe("Secrets Scanner", () => {
  it("detects known secret formats", () => {
    expect(scanForSecrets("key = \"AKIAIOSFODNN7EXAMPLE\" and more")).toMatch(/AWS access key/);
    expect(scanForSecrets("token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm")).toMatch(/GitHub token/);
    expect(scanForSecrets("Bearer sk-proj-abcdefghij01234567890ABCDE")).toMatch(/OpenAI or Anthropic/);
    expect(scanForSecrets("pk=sk_live_abcdefghijklmnop")).toMatch(/Stripe API key/);
    expect(scanForSecrets("key=AIzaSyA-1234567890abcdefghijklmnopqrstuvw")).toMatch(/Google API key/);
    expect(scanForSecrets("slack=xoxb-123456-abcdef")).toMatch(/Slack token/);
    expect(scanForSecrets("-----BEGIN RSA PRIVATE KEY-----")).toMatch(/Private key/);
    expect(scanForSecrets("aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY")).toMatch(
      /AWS secret access key/,
    );
  });

  it("detects hardcoded credential assignments but ignores placeholders", () => {
    expect(scanForSecrets("const config = { password: \"correct-horse-battery\" }")).toMatch(
      /Hardcoded credential assignment/,
    );
    expect(scanForSecrets("const config = { apiKey: \"your-api-key-here\" }")).toBeNull();
    expect(scanForSecrets("const config = { authToken: \"<token-from-env>\" }")).toBeNull();
    expect(scanForSecrets("const config = { apiKey: process.env.API_KEY }")).toBeNull();
  });

  it("passes clean content", () => {
    expect(scanForSecrets("const greeting = 'hello world'; export default greeting;")).toBeNull();
    expect(scanForSecrets("risk-based testing and task-description docs")).toBeNull();
  });

  it("guardToolCall throws with guidance", () => {
    expect(() => guardToolCall("edit", { newString: "AKIAIOSFODNN7EXAMPLE" })).toThrow(
      /AGENT_SKILLS_DISABLE_SECRETS_SCANNER/,
    );
  });
});

describe("Secrets Scanner plugin", () => {
  it("blocks write and edit calls containing secrets", async () => {
    const harness = createHarness();
    await SecretsScannerPlugin.setup(harness.context);
    const hook = getHook(harness.hooks.tool, "execute.before");

    await expect(
      hook({
        tool: "write",
        input: { filePath: "a.ts", content: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm" },
      } as never),
    ).rejects.toThrow(/secrets-scanner/);

    await expect(
      hook({
        tool: "edit",
        input: { filePath: "a.ts", oldString: "before", newString: "AKIAIOSFODNN7EXAMPLE" },
      } as never),
    ).rejects.toThrow(/secrets-scanner/);

    await expect(
      hook({
        tool: "read",
        input: { filePath: ".env", content: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm" },
      } as never),
    ).resolves.toBeUndefined();
  });

  it("honors the disable escape hatch", async () => {
    await withEnvVar("AGENT_SKILLS_DISABLE_SECRETS_SCANNER", "1", async () => {
      const harness = createHarness();
      await SecretsScannerPlugin.setup(harness.context);
      const hook = getHook(harness.hooks.tool, "execute.before");

      await expect(
        hook({
          tool: "write",
          input: { content: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm" },
        } as never),
      ).resolves.toBeUndefined();
    });
  });
});

describe("Tool Guardian", () => {
  it("blocks catastrophic delete targets", () => {
    expect(findDangerousCommand("rm -rf /")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -fr ~")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -r -f $HOME")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf .")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf *")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("Remove-Item -Recurse -Force C:\\")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm --recursive --force /")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm --recursive --force ~")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm --recursive --force .")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm --recursive --force *")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -r --force /")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm --recursive -f /")).toMatch(/Recursive force delete/);
  });

  it("blocks glob, quoted, and traversal variants of catastrophic targets", () => {
    expect(findDangerousCommand("rm -rf /*")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -fr /*")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf /* --no-preserve-root")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ~/*")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf $HOME/*")).toMatch(/Recursive force delete/);
    // eslint-disable-next-line no-template-curly-in-string -- literal shell string under test
    expect(findDangerousCommand("rm -rf ${HOME}/*")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf \"$HOME\"")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf /.")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf /..")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -r -f /tmp/..")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf /home/../")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("Remove-Item -Recurse -Force C:\\*")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("Remove-Item -Recurse -Force \"$env:USERPROFILE\"")).toMatch(/Recursive force delete/);
  });

  it("blocks Windows-native recursive quiet deletes of drive roots", () => {
    expect(findDangerousCommand("del /s /q C:\\")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rmdir /s /q C:\\")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("del /s /f C:\\*")).toMatch(/Recursive force delete/);
  });

  it("allows specific-path deletes", () => {
    expect(findDangerousCommand("rm -rf node_modules")).toBeNull();
    expect(findDangerousCommand("rm -rf ~/projects/demo")).toBeNull();
    expect(findDangerousCommand("rm src/old.ts")).toBeNull();
    expect(findDangerousCommand("Remove-Item -Recurse -Force .\\dist\\cache")).toBeNull();
    expect(findDangerousCommand("rm --recursive --force node_modules")).toBeNull();
    expect(findDangerousCommand("rm --recursive --force ./build/cache")).toBeNull();
    expect(findDangerousCommand("rm -rf /tmp/build")).toBeNull();
    expect(findDangerousCommand("rm -rf ./build/*")).toBeNull();
    expect(findDangerousCommand("del /s /q C:\\temp\\cache")).toBeNull();
  });

  it("blocks force push but allows force-with-lease", () => {
    expect(findDangerousCommand("git push --force origin main")).toMatch(/force push/);
    expect(findDangerousCommand("git push -f")).toMatch(/force push/);
    expect(findDangerousCommand("git push --force-with-lease origin main")).toBeNull();
    expect(findDangerousCommand("git push --force-if-includes origin main")).toBeNull();
    expect(findDangerousCommand("git push origin main")).toBeNull();
  });

  it("blocks disk destroy and SQL drops", () => {
    expect(findDangerousCommand("mkfs.ext4 /dev/sda1")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("dd if=backup.img of=/dev/sda")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("format c:")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("psql -c 'DROP TABLE users'")).toMatch(/DROP TABLE/);
    expect(findDangerousCommand("mysql -e 'DROP DATABASE prod'")).toMatch(/DROP TABLE/);
    expect(findDangerousCommand("chmod -R 777 /")).toMatch(/chmod/);
  });

  it("allows normal commands", () => {
    expect(findDangerousCommand("bun run typecheck")).toBeNull();
    expect(findDangerousCommand("git reset --hard HEAD~1")).toBeNull();
    expect(findDangerousCommand("chmod +x scripts/build.sh")).toBeNull();
  });

  it("guardBashCommand throws with guidance", () => {
    expect(() => guardBashCommand("rm -rf /")).toThrow(/AGENT_SKILLS_DISABLE_TOOL_GUARDIAN/);
  });
});

describe("Tool Guardian plugin", () => {
  it("blocks destructive shell commands and allows safe commands", async () => {
    const harness = createHarness();
    await ToolGuardianPlugin.setup(harness.context);
    const hook = getHook(harness.hooks.shell, "create.before");

    await expect(hook({ command: "rm -rf /" } as never)).rejects.toThrow(/tool-guardian/);
    await expect(hook({ command: "bun run test" } as never)).resolves.toBeUndefined();
  });

  it("honors the disable escape hatch", async () => {
    await withEnvVar("AGENT_SKILLS_DISABLE_TOOL_GUARDIAN", "1", async () => {
      const harness = createHarness();
      await ToolGuardianPlugin.setup(harness.context);
      const hook = getHook(harness.hooks.shell, "create.before");

      await expect(hook({ command: "rm -rf /" } as never)).resolves.toBeUndefined();
    });
  });
});

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

describe("V2 plugin definitions", () => {
  it("use stable unique ids", () => {
    const ids = [CompactionPlugin.id, SecretsScannerPlugin.id, ToolGuardianPlugin.id];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "agent-skills.compaction",
      "agent-skills.secrets-scanner",
      "agent-skills.tool-guardian",
    ]);
  });
});
