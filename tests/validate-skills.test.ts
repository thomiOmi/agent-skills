import { describe, it, expect } from "bun:test"
import { existsSync, readdirSync, readFileSync } from "fs"
import { join, dirname } from "pathe"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, "..")
const SKILLS_DIR = join(REPO_ROOT, "skills")

describe("SKILL.md validation", () => {
  it("all skill directories contain a SKILL.md", () => {
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    for (const dir of dirs) {
      const skillFile = join(SKILLS_DIR, dir, "SKILL.md")
      expect(existsSync(skillFile)).toBe(true)
    }
  })

  it("each SKILL.md name field matches its directory name", () => {
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    for (const dir of dirs) {
      const skillFile = join(SKILLS_DIR, dir, "SKILL.md")
      const content = readFileSync(skillFile, "utf-8")
      const match = content.match(/^name:\s*(.+)$/m)
      if (match) {
        const name = match[1].trim()
        expect(name).toBe(dir)
      }
    }
  })

  it("each SKILL.md description field is non-empty and under 1024 chars", () => {
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    for (const dir of dirs) {
      const skillFile = join(SKILLS_DIR, dir, "SKILL.md")
      const content = readFileSync(skillFile, "utf-8")
      const match = content.match(/^description:\s*(.+)$/m)
      if (match) {
        const desc = match[1].trim()
        expect(desc.length).toBeGreaterThan(0)
        expect(desc.length).toBeLessThanOrEqual(1024)
      }
    }
  })

  it("all 12 skills are present", () => {
    const expected = [
      "task-decomposition",
      "code-style",
      "api-conventions",
      "testing",
      "documentation",
      "planning",
      "debugging",
      "ai-integration",
      "sdlc-documentation",
      "git-workflow",
      "security-review",
      "database",
    ]
    const entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    for (const skill of expected) {
      expect(dirs).toContain(skill)
    }
  })
})

describe("AGENTS.md validation", () => {
  it("AGENTS.md exists and is non-empty", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md")
    expect(existsSync(agentsPath)).toBe(true)
    const content = readFileSync(agentsPath, "utf-8")
    expect(content.length).toBeGreaterThan(10)
  })

  it("AGENTS.md contains no emoji characters", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md")
    const content = readFileSync(agentsPath, "utf-8")
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    expect(emojiRegex.test(content)).toBe(false)
  })

  it("AGENTS.md has Must do section", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md")
    const content = readFileSync(agentsPath, "utf-8")
    expect(content).toContain("Must do")
  })

  it("AGENTS.md has Must not do section", () => {
    const agentsPath = join(REPO_ROOT, "AGENTS.md")
    const content = readFileSync(agentsPath, "utf-8")
    expect(content).toContain("Must not do")
  })
})