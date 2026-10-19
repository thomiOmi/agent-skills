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
    options: ["copy", "symlink", "merge"],
    description: "Install mode: copy (default), symlink, or merge",
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
    description: "Skip backup before install (copy mode only)",
  },
  "backup-path": {
    type: "string" as const,
    description: "Use existing backup as merge source (copy mode only)",
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
  };
}

async function printVersion(): Promise<void> {
  const pkg = await readPackageJSON(resolve(getRepoRoot(), "package.json"));
  consola.log(pkg.version ?? "0.0.0");
}

const main = defineCommand({
  meta: {
    name: "agent-skills",
    description: "Install agent-skills repo into OpenCode global config",
  },
  args: installArgs,
  run: async ({ args }) => {
    if (args.version) {
      await printVersion();
      return;
    }
    await installCommand(toInstallOptions(args));
  },
  subCommands: {
    install: defineCommand({
      meta: {
        name: "install",
        description: "Install agents, skills, tools, commands, plugin, and config into OpenCode global config",
      },
      args: installArgs,
      run: async ({ args }) => {
        if (args.version) {
          await printVersion();
          return;
        }
        await installCommand(toInstallOptions(args));
      },
    }),
  },
});

runMain(main);
