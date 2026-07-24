import { consola } from "consola"
import { ohash } from "ohash"
import { join } from "pathe"
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "fs/promises"
import { exists } from "fs/promises"
import { homedir } from "os"
import type { SkillInfo, InstallResult, OpenCodeConfig } from "./types"

export async function syncSkills(
  skillsDir: string,
  packageSkillsDir: string
): Promise<InstallResult> {
  const result: InstallResult = {
    success: true,
    skillsInstalled: [],
    skillsSkipped: [],
    errors: [],
    warnings: [],
  }

  try {
    await mkdir(skillsDir, { recursive: true })
  } catch (error) {
    result.errors.push(`Failed to create skills directory ${skillsDir}: ${error}`)
    result.success = false
    return result
  }

  let skillNames: string[] = []
  try {
    skillNames = await readdir(packageSkillsDir)
  } catch (error) {
    result.errors.push(`Failed to read skills source directory ${packageSkillsDir}: ${error}`)
    result.success = false
    return result
  }

  for (const skillName of skillNames) {
    const srcSkillDir = join(packageSkillsDir, skillName)
    const destSkillDir = join(skillsDir, skillName)

    try {
      const srcStat = await stat(srcSkillDir)
      if (!srcStat.isDirectory()) {
        continue
      }
    } catch {
      continue
    }

    const srcHash = await computeDirHash(srcSkillDir)
    let destHash: string | null = null

    try {
      if (await exists(destSkillDir)) {
        destHash = await computeDirHash(destSkillDir)
      }
    } catch {
      // ignore hash errors
    }

    if (srcHash === destHash && destHash !== null) {
      consola.debug(`Skill ${skillName} unchanged, skipping`)
      result.skillsSkipped.push(skillName)
      continue
    }

    try {
      await rm(destSkillDir, { recursive: true, force: true })
      await copyDir(srcSkillDir, destSkillDir)
      result.skillsInstalled.push(skillName)
      consola.info(`Installed skill: ${skillName}`)
    } catch (error) {
      result.errors.push(`Failed to install skill ${skillName}: ${error}`)
      result.success = false
      consola.error(`Failed to install skill ${skillName}: ${error}`)
    }
  }

  return result
}

function copyDir(src: string, dest: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      await mkdir(dest, { recursive: true })
      const entries = await readdir(src, { withFileTypes: true })

      for (const entry of entries) {
        const srcPath = join(src, entry.name)
        const destPath = join(dest, entry.name)

        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath)
        } else {
          await copyFile(srcPath, destPath)
        }
      }

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

async function computeDirHash(dir: string): Promise<string> {
  const hashInput: string[] = []
  await walkDir(dir, (filePath, content) => {
    hashInput.push(`${filePath}:${ohash(content)}`)
  })
  return ohash(hashInput.sort().join("|"))
}

function walkDir(
  dir: string,
  callback: (filePath: string, content: string) => void
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          await walkDir(fullPath, callback)
        } else {
          const content = await readFileContent(fullPath)
          callback(fullPath, content)
        }
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

async function readFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8")
  } catch (e) {
    return ""
  }
}
}

export async function getInstallPaths(): Promise<{
  opencodeDir: string
  skillsDir: string
  agentsDir: string
  configPath: string
}> {
  const home = homedir()
  const opencodeDir = join(home, ".config", "opencode")
  return {
    opencodeDir,
    skillsDir: join(opencodeDir, "skills"),
    agentsDir: join(opencodeDir, "agents"),
    configPath: join(opencodeDir, "opencode.jsonc"),
  }
}

export async function isAgentSkillsInstalled(skillsDir: string): Promise<boolean> {
  try {
    const entries = await readdir(skillsDir)
    return entries.length > 0
  } catch {
    return false
  }
}