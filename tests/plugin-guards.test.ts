import { describe, expect, it } from "bun:test";
import { guardToolCall, scanForSecrets, SecretsScannerPlugin } from "../plugin/secrets-scanner";
import { findDangerousCommand, ToolGuardianPlugin } from "../plugin/tool-guardian";

// Built from fragments so test fixtures do not embed literal secret values.
const ENCRYPTED_PRIVATE_KEY_HEADER = ["-----BEGIN ", "ENCRYPTED ", "PRIVATE KEY-----"].join("");
const AWS_ACCESS_KEY = "AKIA" + "IOSFODNN7EXAMPLE";
const SHORT_PASSWORD_ASSIGNMENT = "password=" + "hunter2";

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
    expect(scanForSecrets(ENCRYPTED_PRIVATE_KEY_HEADER)).toMatch(/Private key/);
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

  it("detects backtick and unquoted credential assignments", () => {
    expect(scanForSecrets("const apiKey = `abcdefghijklmnopqrstuvwxyz12`;")).toMatch(
      /Hardcoded credential assignment/,
    );
    expect(scanForSecrets("password=hunter2secretpassword")).toMatch(
      /Hardcoded credential assignment/,
    );
    expect(scanForSecrets("const config = { apiKey: process.env.API_KEY }")).toBeNull();
  });

  it("masks generic credential values without leaking a prefix", () => {
    const finding = scanForSecrets("const config = { password: \"correct-horse-battery\" }");
    expect(finding).toMatch(/Hardcoded credential assignment/);
    expect(finding).not.toContain("corr");
    expect(scanForSecrets("token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm")).toMatch(
      /ghp_\*\*\*\*/,
    );
  });

  it("scans the tail of large content and fails closed on unscanned gaps", () => {
    const prefix = `${"x".repeat(100_000)} `;
    expect(scanForSecrets(`${prefix}AKIAIOSFODNN7EXAMPLE`)).toMatch(/AWS access key/);
    expect(scanForSecrets("x".repeat(250_000))).toMatch(/Unscanned content/);
  });

  it("passes clean content", () => {
    expect(scanForSecrets("const greeting = 'hello world'; export default greeting;")).toBeNull();
    expect(scanForSecrets("risk-based testing and task-description docs")).toBeNull();
  });

  it("detects short password assignments without flagging code constants", () => {
    expect(scanForSecrets(SHORT_PASSWORD_ASSIGNMENT)).toMatch(/Hardcoded credential/);
    expect(scanForSecrets("const API_KEY = SOME_LONG_CONSTANT_2;")).toBeNull();
  });

  it("applies the template-expression exemption only at the start of a value", () => {
    // eslint-disable-next-line no-template-curly-in-string -- literal credential value under test
    expect(scanForSecrets("password: \"" + "${ENV_VALUE}\"")).toBeNull();
    // eslint-disable-next-line no-template-curly-in-string -- literal credential value under test
    expect(scanForSecrets("password: \"" + "hunter${ENV_VALUE}\"")).toMatch(/Hardcoded credential/);
  });

  it("overlaps scan windows so a boundary-straddling token is found", () => {
    const prefix = `${"x".repeat(100_000 - 10 - 1)} `;
    const suffix = ` ${"x".repeat(200_000 - prefix.length - AWS_ACCESS_KEY.length - 1)}`;
    expect(scanForSecrets(prefix + AWS_ACCESS_KEY + suffix)).toMatch(/AWS access key/);
    expect(scanForSecrets("x".repeat(200_001))).toMatch(/Unscanned content/);
  });

  it("scans content fields beyond the old string cap", () => {
    const fields = Array.from({ length: 600 }, (_item, index) => ({
      content: index === 599 ? AWS_ACCESS_KEY : "safe content",
    }));
    expect(() => guardToolCall("write", { fields })).toThrow(/secrets-scanner/);
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

  it("ignores filePath and oldString when scanning writes and edits", async () => {
    const harness = createHarness();
    await SecretsScannerPlugin.setup(harness.context);
    const hook = getHook(harness.hooks.tool, "execute.before");

    await expect(
      hook({
        tool: "edit",
        input: {
          filePath: "a.ts",
          oldString: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm",
          newString: "const token = process.env.GITHUB_TOKEN;",
        },
      } as never),
    ).resolves.toBeUndefined();

    await expect(
      hook({
        tool: "write",
        input: {
          filePath: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm.ts",
          content: "const greeting = 'hello';",
        },
      } as never),
    ).resolves.toBeUndefined();

    await expect(
      hook({
        tool: "edit",
        input: {
          filePath: "a.ts",
          oldString: "before",
          newString: "AKIAIOSFODNN7EXAMPLE",
        },
      } as never),
    ).rejects.toThrow(/secrets-scanner/);
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

  it("blocks uppercase force-delete flag variants", () => {
    expect(findDangerousCommand("rm -RF /")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rF /")).toMatch(/Recursive force delete/);
  });

  it("blocks delete commands split by shell metacharacters", () => {
    expect(findDangerousCommand("rm -rf /; echo ok")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ~/;echo")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf /|cat")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("echo ok && rm -rf /")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf /\n echo ok")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("(rm -rf /)")).toMatch(/Recursive force delete/);
  });

  it("blocks relative traversal escapes to parent and home", () => {
    expect(findDangerousCommand("rm -rf ../..")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ../../")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ../*")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ../../*")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ../../..")).toMatch(/Recursive force delete/);
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

  it("scopes the force-with-lease exemption to the git push invocation", () => {
    expect(findDangerousCommand("echo --force-with-lease; git push --force origin main")).toMatch(
      /force push/,
    );
    expect(findDangerousCommand("git push --force origin main; echo --force-with-lease")).toMatch(
      /force push/,
    );
    expect(findDangerousCommand("git push --force-with-lease=x --force origin main")).toMatch(
      /force push/,
    );
    expect(findDangerousCommand("git push --force-with-lease origin main")).toBeNull();
  });

  it("blocks disk destroy and SQL drops", () => {
    expect(findDangerousCommand("mkfs.ext4 /dev/sda1")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("dd if=backup.img of=/dev/sda")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("format c:")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("psql -c 'DROP TABLE users'")).toMatch(/DROP TABLE/);
    expect(findDangerousCommand("mysql -e 'DROP DATABASE prod'")).toMatch(/DROP TABLE/);
    expect(findDangerousCommand("chmod -R 777 /")).toMatch(/chmod/);
  });

  it("blocks disk destroy and chmod root variants case-insensitively", () => {
    expect(findDangerousCommand("MKFS.ext4 /dev/sda1")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("DD if=backup.img of=/dev/sda")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("FDISK /dev/sda")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("chmod --recursive 777 /")).toMatch(/chmod/);
    expect(findDangerousCommand("chmod -R 777 /.")).toMatch(/chmod/);
    expect(findDangerousCommand("chmod -R 777 $HOME")).toMatch(/chmod/);
    // eslint-disable-next-line no-template-curly-in-string -- literal shell string under test
    expect(findDangerousCommand("chmod -R 777 ${HOME}")).toMatch(/chmod/);
  });

  it("allows destroy-like words outside command position", () => {
    expect(findDangerousCommand("echo fdisk")).toBeNull();
    expect(findDangerousCommand("echo MKFS.ext4")).toBeNull();
    expect(findDangerousCommand("echo chmod -R 777 /")).toBeNull();
  });

  it("allows normal commands", () => {
    expect(findDangerousCommand("bun run typecheck")).toBeNull();
    expect(findDangerousCommand("git reset --hard HEAD~1")).toBeNull();
    expect(findDangerousCommand("chmod +x scripts/build.sh")).toBeNull();
  });

  it("blocks commands wrapped in shell backticks", () => {
    expect(findDangerousCommand("`rm -rf /`")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("echo ok `rm -rf /`")).toMatch(/Recursive force delete/);
  });

  it("blocks force push combined with lease or no-lease flags", () => {
    expect(findDangerousCommand("git push --force-with-lease origin main --force")).toMatch(/force push/);
    expect(findDangerousCommand("git push --force-with-lease origin main -f")).toMatch(/force push/);
    expect(findDangerousCommand("git push --force-with-lease --no-force-with-lease origin main")).toMatch(
      /force push/,
    );
    expect(findDangerousCommand("git push --no-force-with-lease origin main")).toMatch(/force push/);
    expect(findDangerousCommand("git push --force-with-lease origin main")).toBeNull();
  });

  it("detects git push after global options", () => {
    expect(findDangerousCommand("git -c core.quotepath=false push --force")).toMatch(/force push/);
    expect(findDangerousCommand("git --no-pager push --force")).toMatch(/force push/);
  });

  it("blocks user home expansion and multi-hop relative traversal", () => {
    expect(findDangerousCommand("rm -rf ~root")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ../foo/../..")).toMatch(/Recursive force delete/);
    expect(findDangerousCommand("rm -rf ./foo/../../..")).toMatch(/Recursive force delete/);
  });

  it("blocks quoted dd targets, sudo/env prefixes, and broader chmod masks", () => {
    expect(findDangerousCommand("dd if=backup.img of=\"/dev/sda\"")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("sudo -u root mkfs.ext4 /dev/sda1")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("sudo --user root mkfs.ext4 /dev/sda1")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("sudo --user=root mkfs.ext4 /dev/sda1")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("env FOO=bar fdisk /dev/sda")).toMatch(/Disk or filesystem/);
    expect(findDangerousCommand("chmod -R 7777 /")).toMatch(/chmod/);
    expect(findDangerousCommand("chmod -R a+w ~")).toMatch(/chmod/);
    expect(findDangerousCommand("sudo chmod -R 7777 /")).toMatch(/chmod/);
  });

  it("does not treat echoed delete commands as destructive", () => {
    expect(findDangerousCommand("echo rm -rf /")).toBeNull();
    expect(findDangerousCommand("echo rm -rf ~")).toBeNull();
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
});

describe("V2 plugin definitions", () => {
  it("use stable unique ids", () => {
    const ids = [SecretsScannerPlugin.id, ToolGuardianPlugin.id];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "agent-skills.secrets-scanner",
      "agent-skills.tool-guardian",
    ]);
  });
});
