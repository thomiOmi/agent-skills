import { describe, expect, it } from "bun:test";
import type { Plugin } from "@opencode-ai/plugin";
import { AgentSkillsPlugin } from "../plugin/agent-skills";
import { guardToolCall, scanForSecrets, SecretsScannerPlugin } from "../plugin/secrets-scanner";
import { findDangerousCommand, guardBashCommand } from "../plugin/tool-guardian";

function harnessCtx(): Parameters<Plugin>[0] {
  return { directory: process.cwd(), worktree: process.cwd() } as unknown as Parameters<Plugin>[0];
}

describe("Secrets Scanner", () => {
  it("detects known secret formats", () => {
    expect(scanForSecrets('key = "AKIAIOSFODNN7EXAMPLE" and more')).toMatch(/AWS access key/);
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

  it("blocks write and edit calls containing secrets via the hook", async () => {
    const plugin = await SecretsScannerPlugin(harnessCtx());
    const hook = plugin["tool.execute.before"];
    expect(hook).toBeDefined();
    await expect(
      hook?.({ tool: "write", sessionID: "s", callID: "c" }, { args: { filePath: "a.ts", content: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm" } }),
    ).rejects.toThrow(/secrets-scanner/);
    await expect(
      hook?.({ tool: "read", sessionID: "s", callID: "c" }, { args: { filePath: ".env", content: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm" } }),
    ).resolves.toBeUndefined();
  });

  it("guardToolCall throws with guidance", () => {
    expect(() => guardToolCall("edit", { newString: "AKIAIOSFODNN7EXAMPLE" })).toThrow(
      /AGENT_SKILLS_DISABLE_SECRETS_SCANNER/,
    );
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
  });

  it("allows specific-path deletes", () => {
    expect(findDangerousCommand("rm -rf node_modules")).toBeNull();
    expect(findDangerousCommand("rm -rf ~/projects/demo")).toBeNull();
    expect(findDangerousCommand("rm src/old.ts")).toBeNull();
    expect(findDangerousCommand("Remove-Item -Recurse -Force .\\dist\\cache")).toBeNull();
  });

  it("blocks force push but allows force-with-lease", () => {
    expect(findDangerousCommand("git push --force origin main")).toMatch(/force push/);
    expect(findDangerousCommand("git push -f")).toMatch(/force push/);
    expect(findDangerousCommand("git push --force-with-lease origin main")).toBeNull();
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

describe("AgentSkillsPlugin harness", () => {
  it("composes both guards into tool.execute.before", async () => {
    const hooks = await AgentSkillsPlugin(harnessCtx());
    const hook = hooks["tool.execute.before"];
    expect(hook).toBeDefined();
    await expect(
      hook?.(
        { tool: "write", sessionID: "s", callID: "c" },
        { args: { filePath: ".env", content: "SECRET_TOKEN=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm" } },
      ),
    ).rejects.toThrow(/secrets-scanner/);
    await expect(
      hook?.({ tool: "bash", sessionID: "s", callID: "c" }, { args: { command: "rm -rf /" } }),
    ).rejects.toThrow(/tool-guardian/);
    await expect(
      hook?.({ tool: "bash", sessionID: "s", callID: "c" }, { args: { command: "bun run test" } }),
    ).resolves.toBeUndefined();
  });
});
