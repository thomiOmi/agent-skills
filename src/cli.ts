import { syncCommand } from "./commands/sync";
import { symlinkCommand } from "./commands/symlink";
import { deployCommand } from "./commands/deploy";

function usage(): never {
  console.log("Usage: bun run src/cli.ts <command> [options]");
  console.log("");
  console.log("Commands:");
  console.log("  sync      Copy repo files into ~/.config/opencode/");
  console.log("  symlink   Create symlinks from repo to ~/.config/opencode/");
  console.log("  deploy    Backup then overwrite ~/.config/opencode/ from repo");
  console.log("");
  console.log("Options:");
  console.log("  --dry-run          Show what would be done without writing");
  console.log("  --skip-backup      Skip backup (deploy only)");
  console.log("  --backup-path <p>  Use existing backup as merge source (deploy only)");
  console.log("");
  process.exit(1);
}

const args = process.argv.slice(2);
const command = args[0];
if (!command) usage();

const dryRun = args.includes("--dry-run");
const skipBackup = args.includes("--skip-backup");
const backupIndex = args.indexOf("--backup-path");
const backupPath = backupIndex !== -1 ? args[backupIndex + 1] : undefined;

switch (command) {
  case "sync":
    syncCommand({ dryRun });
    break;
  case "symlink":
    symlinkCommand({ dryRun });
    break;
  case "deploy":
    deployCommand({ dryRun, skipBackup, backupPath });
    break;
  default:
    usage();
}
