import { homedir } from "os";
import { join, resolve, dirname } from "pathe";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getRepoRoot(): string {
  return resolve(__dirname, "..", "..");
}

export function getGlobalRoot(targetOverride?: string): string {
  if (targetOverride) {
    return resolve(targetOverride);
  }
  if (process.env.OPENCODE_CONFIG_DIR) {
    return resolve(process.env.OPENCODE_CONFIG_DIR);
  }
  return join(homedir(), ".config", "opencode");
}

export function getGlobalAgentsRoot(targetOverride?: string): string {
  if (targetOverride) {
    return resolve(targetOverride, "..", ".agents");
  }
  if (process.env.OPENCODE_AGENTS_DIR) {
    return resolve(process.env.OPENCODE_AGENTS_DIR);
  }
  return join(homedir(), ".agents");
}

export function getBackupRoot(targetOverride?: string): string {
  if (targetOverride) {
    return resolve(targetOverride, "backups");
  }
  if (process.env.OPENCODE_BACKUP_DIR) {
    return resolve(process.env.OPENCODE_BACKUP_DIR);
  }
  return join(homedir(), ".config", "opencode-backups");
}

export function getTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${M}${d}-${h}${m}${s}`;
}

export function repoSubdir(sub: string): string {
  return join(getRepoRoot(), sub);
}
