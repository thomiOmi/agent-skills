import type { ConfigEnvironmentSnapshot, InstallerFixture } from "./installer-fixture";
import { basename, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
  ConfigParseError,
  hasJsonComments,
  prepareConfigs,
  writeConfigFile,
} from "../src/lib/install/config-merge";
import {
  createInstallerFixture,
  isolateConfigEnvironment,
  removeInstallerFixture,
  writeFixtureFile,
} from "./installer-fixture";

const fixtures: InstallerFixture[] = [];
const environmentSnapshots: ConfigEnvironmentSnapshot[] = [];

beforeEach(() => {
  environmentSnapshots.push(isolateConfigEnvironment());
});

afterEach(async () => {
  environmentSnapshots.pop()?.restore();
  await Promise.all(fixtures.splice(0).map(removeInstallerFixture));
});

async function createFixture(): Promise<InstallerFixture> {
  const fixture = await createInstallerFixture();
  fixtures.push(fixture);
  return fixture;
}

describe("Installer config merge", () => {
  it("fills missing values from the template", async () => {
    const fixture = await createFixture();
    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(configs.openCode.value.$schema).toBe("https://opencode.ai/config.json");
    expect(configs.openCode.value.default_agent).toBe("plan");
    expect(configs.openCode.value.experimental).toEqual({ subagent_depth: 2 });
    expect(configs.openCode.value.instructions).toEqual(["AGENTS.md"]);
    expect(configs.openCode.changed).toBe(true);
    expect(configs.openCode.path).toBe(join(fixture.target, "opencode.jsonc"));
  });

  it("preserves V2 keys, unknown keys, and user choices", async () => {
    const fixture = await createFixture();
    const userConfig = {
      default_agent: "build",
      small_model: "custom/small",
      permissions: [
        { action: "read", resource: "*", effect: "allow" },
        { action: "edit", resource: "*", effect: "deny" },
      ],
      plugins: ["custom-plugin"],
      providers: { custom: { npm: "@custom/provider" } },
      agents: { custom: { mode: "subagent" } },
      instructions: ["custom.md"],
      watcher: { ignore: ["custom/**"] },
      mcp: { custom: { type: "local", command: ["custom"] } },
      unknown_key: { keep: true },
    };
    await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      JSON.stringify(userConfig, null, 2),
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);
    const value = configs.openCode.value;

    expect(value.default_agent).toBe("build");
    expect(value.small_model).toBe("custom/small");
    expect(value.permissions).toEqual(userConfig.permissions);
    expect(value.plugins).toEqual(["custom-plugin"]);
    expect(value.providers).toEqual({ custom: { npm: "@custom/provider" } });
    expect(value.agents).toEqual({ custom: { mode: "subagent" } });
    expect(value.instructions).toEqual(["custom.md", "AGENTS.md"]);
    expect(value.watcher).toEqual({ ignore: ["custom/**"] });
    expect(value.mcp).toEqual({ custom: { type: "local", command: ["custom"] } });
    expect(value.unknown_key).toEqual({ keep: true });
  });

  it("does not force default_agent or small_model", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      JSON.stringify({ default_agent: "build" }, null, 2),
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(configs.openCode.value.default_agent).toBe("build");
    expect(configs.openCode.value.small_model).toBeUndefined();
  });

  it("migrates top-level subagent_depth to experimental", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      JSON.stringify({ subagent_depth: 4 }, null, 2),
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(configs.openCode.value.subagent_depth).toBeUndefined();
    expect(configs.openCode.value.experimental).toEqual({ subagent_depth: 4 });
    expect(configs.openCode.warnings.some(warning => warning.includes("Moved"))).toBe(true);
  });

  it("keeps experimental.subagent_depth over a legacy value", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      JSON.stringify(
        { subagent_depth: 4, experimental: { subagent_depth: 5 } },
        null,
        2,
      ),
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(configs.openCode.value.subagent_depth).toBeUndefined();
    expect(configs.openCode.value.experimental).toEqual({ subagent_depth: 5 });
    expect(
      configs.openCode.warnings.some(warning => warning.includes("already exists")),
    ).toBe(true);
  });

  it("ignores an invalid legacy subagent_depth", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      JSON.stringify({ subagent_depth: "fast" }, null, 2),
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(configs.openCode.value.subagent_depth).toBeUndefined();
    expect(configs.openCode.value.experimental).toEqual({ subagent_depth: 2 });
    expect(
      configs.openCode.warnings.some(warning => warning.includes("Ignored invalid")),
    ).toBe(true);
  });

  it("throws a ConfigParseError for an invalid existing config", async () => {
    const fixture = await createFixture();
    const configPath = await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      "{ \"default_agent\": }",
    );

    try {
      await prepareConfigs(fixture.repo, fixture.target);
      throw new Error("Expected prepareConfigs to reject");
    }
    catch (error) {
      expect(error).toBeInstanceOf(ConfigParseError);
      expect((error as ConfigParseError).configPath).toBe(configPath);
    }
  });

  it("replaces an invalid existing config when force is set", async () => {
    const fixture = await createFixture();
    const configPath = await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      "{ \"default_agent\": }",
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target, { force: true });

    expect(configs.openCode.changed).toBe(true);
    expect(configs.openCode.path).toBe(configPath);
    expect(configs.openCode.value.default_agent).toBe("plan");
    expect(
      configs.openCode.warnings.some(warning => warning.includes("--force")),
    ).toBe(true);
  });

  it("detects comments outside string values", () => {
    expect(hasJsonComments("{\"url\":\"https://example.com\"}")).toBe(false);
    expect(hasJsonComments("{\"a\":1} // comment")).toBe(true);
    expect(hasJsonComments("{ /* block */ \"a\": 1 }")).toBe(true);
    expect(hasJsonComments("{\"a\":\"\\\" // not a comment\"}")).toBe(false);
  });

  it("warns when a rewrite drops comments", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(
      fixture.target,
      "opencode.jsonc",
      "{\n  // keep this note\n  \"default_agent\": \"build\"\n}\n",
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(configs.openCode.changed).toBe(true);
    expect(
      configs.openCode.warnings.some(warning => warning.includes("Comments")),
    ).toBe(true);
  });

  it("writes to an existing opencode.json instead of creating a duplicate", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(
      fixture.target,
      "opencode.json",
      JSON.stringify({ default_agent: "build" }, null, 2),
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(basename(configs.openCode.path)).toBe("opencode.json");
    expect(await Bun.file(join(fixture.target, "opencode.jsonc")).exists()).toBe(false);
  });

  it("preserves TUI keys and uses an existing tui.json", async () => {
    const fixture = await createFixture();
    await writeFixtureFile(
      fixture.target,
      "tui.json",
      JSON.stringify(
        { theme: "custom", keybinds: { leader: "ctrl+x" } },
        null,
        2,
      ),
    );

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(basename(configs.tui.path)).toBe("tui.json");
    expect(configs.tui.value.theme).toBe("custom");
    expect(configs.tui.value.keybinds).toEqual({ leader: "ctrl+x" });
    expect(configs.tui.value.attention).toEqual({ enabled: true });
  });

  it("is idempotent after writing the prepared configs", async () => {
    const fixture = await createFixture();
    const first = await prepareConfigs(fixture.repo, fixture.target);

    await writeConfigFile(first.openCode.path, first.openCode.value, false);
    await writeConfigFile(first.tui.path, first.tui.value, false);

    const second = await prepareConfigs(fixture.repo, fixture.target);

    expect(second.openCode.changed).toBe(false);
    expect(second.tui.changed).toBe(false);
  });

  it("uses OPENCODE_CONFIG as a source and warns about the destination", async () => {
    const fixture = await createFixture();
    const externalPath = await writeFixtureFile(
      fixture.sandbox,
      "external.jsonc",
      JSON.stringify({ default_agent: "build" }, null, 2),
    );
    process.env.OPENCODE_CONFIG = externalPath;

    const configs = await prepareConfigs(fixture.repo, fixture.target);

    expect(configs.openCode.value.default_agent).toBe("build");
    expect(configs.openCode.path).toBe(join(fixture.target, "opencode.jsonc"));
    expect(
      configs.openCode.warnings.some(warning => warning.includes("external.jsonc")),
    ).toBe(true);
  });
});
