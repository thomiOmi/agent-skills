#!/usr/bin/env bun
import type { InstallMode } from "./commands/install";
import { defineCommand, runMain } from "citty";
import { consola } from "consola";
import { resolve } from "pathe";
import { readPackageJSON } from "pkg-types";
import { installCommand } from "./commands/install";
import { getRepoRoot } from "./lib/paths";

const installArgs = {
  "mode": {
    type: "enum" as const,
    options: ["merge", "replace", "symlink", "copy"],
    description: "Install mode: merge (default), replace, symlink, or copy (deprecated alias for replace)",
  },
  "force": {
    type: "boolean" as const,
    description: "Overwrite unmanaged paths in replace or symlink mode",
  },
  "source": {
    type: "string" as const,
    description: "Source repository path (defaults to the cloned repository)",
    valueHint: "path",
  },
  "dry-run": {
    type: "boolean" as const,
    description: "Show what would be done without writing",
  },
  "target": {
    type: "string" as const,
    description: "Target directory (default: ~/.config/opencode)",
    valueHint: "path",
  },
  "skip-backup": {
    type: "boolean" as const,
    description: "Skip backup before install",
  },
  "backup-path": {
    type: "string" as const,
    description: "Custom backup root; a timestamped directory is created inside it",
    valueHint: "path",
  },
  "version": {
    type: "boolean" as const,
    description: "Print the installed package version",
  },
};

function toInstallOptions(args: Record<string, unknown>) {
  return {
    mode: args.mode as InstallMode | undefined,
    source: args.source as string | undefined,
    dryRun: args["dry-run"] as boolean | undefined,
    targetDir: args.target as string | undefined,
    skipBackup: args["skip-backup"] as boolean | undefined,
    backupPath: args["backup-path"] as string | undefined,
    force: args.force as boolean | undefined,
  };
}

async function printVersion(): Promise<void> {
  const pkg = await readPackageJSON(resolve(getRepoRoot(), "package.json"));
  consola.log(pkg.version ?? "0.0.0");
}

const installSubCommand = defineCommand({
  meta: {
    name: "install",
    description: "Install agents, skills, commands, plugin, and config into OpenCode global config",
  },
  args: installArgs,
  run: async ({ args }) => {
    if (args.version) {
      await printVersion();
      return;
    }
    await installCommand(toInstallOptions(args));
  },
});

const main = defineCommand({
  meta: {
    name: "agent-skills",
    description: "Install agent-skills repo into OpenCode global config",
  },
  args: installArgs,
  subCommands: {
    install: installSubCommand,
  },
  default: "install",
});

runMain(main);
