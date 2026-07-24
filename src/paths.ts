import { dirname, join, normalize } from "pathe"
import { homedir } from "os"

export function getOpenCodeConfigDir(): string {
  const home = homedir()
  const candidate = join(home, ".config", "opencode")
  return candidate
}

export function getOpenCodeSkillsDir(): string {
  return join(getOpenCodeConfigDir(), "skills")
}

export function getOpenCodeAgentsDir(): string {
  return join(getOpenCodeConfigDir(), "agents")
}

export function getUniversalSkillsDir(): string {
  const home = homedir()
  return join(home, ".agents", "skills")
}

export function getUniversalAgentsDir(): string {
  const home = homedir()
  return join(home, ".agents", "agents")
}

export function getOpenCodeConfigPath(): string {
  return join(getOpenCodeConfigDir(), "opencode.jsonc")
}

export function getOpenCodeConfigJsonPath(): string {
  return join(getOpenCodeConfigDir(), "opencode.json")
}

export function getProjectRelativePath(repoRoot: string, relativePath: string): string {
  return normalize(join(repoRoot, relativePath))
}

export function ensureDir(dir: string): void {
  // Bun's $ or process.mkdirSync handles this; this is a utility wrapper
  // Actual fs ops go through install.ts or plugin hooks
}

export function crossPlatformJoin(...segments: string[]): string {
  return join(...segments)
}