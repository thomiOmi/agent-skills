import { defineCommand, runMain } from "citty";
import { syncCommand } from "./commands/sync";
import { symlinkCommand } from "./commands/symlink";
import { deployCommand } from "./commands/deploy";

const main = defineCommand({
  meta: {
    name: "opencode-deploy",
    description: "Deploy agent-skills repo to OpenCode global config",
  },
  subCommands: {
    sync: defineCommand({
      meta: {
        name: "sync",
        description: "Copy repo files into ~/.config/opencode/",
      },
      args: {
        "dry-run": {
          type: "boolean",
          description: "Show what would be done without writing",
        },
      },
      run: async ({ args }) => {
        await syncCommand({ dryRun: args["dry-run"] });
      },
    }),
    symlink: defineCommand({
      meta: {
        name: "symlink",
        description: "Create symlinks from repo to ~/.config/opencode/",
      },
      args: {
        "dry-run": {
          type: "boolean",
          description: "Show what would be done without writing",
        },
      },
      run: async ({ args }) => {
        await symlinkCommand({ dryRun: args["dry-run"] });
      },
    }),
    deploy: defineCommand({
      meta: {
        name: "deploy",
        description: "Backup then overwrite ~/.config/opencode/ from repo",
      },
      args: {
        "dry-run": {
          type: "boolean",
          description: "Show what would be done without writing",
        },
        "skip-backup": {
          type: "boolean",
          description: "Skip backup",
        },
        "backup-path": {
          type: "string",
          description: "Use existing backup as merge source",
          valueHint: "path",
        },
      },
      run: async ({ args }) => {
        await deployCommand({
          dryRun: args["dry-run"],
          skipBackup: args["skip-backup"],
          backupPath: args["backup-path"],
        });
      },
    }),
  },
});

runMain(main);
