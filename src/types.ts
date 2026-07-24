export interface PluginContext {
  project: Record<string, unknown>
  directory: string
  worktree: string | undefined
  client: {
    app: {
      log: (entry: LogEntry) => Promise<boolean>
    }
    config: {
      get: () => Promise<OpenCodeConfig | null>
      set: (config: Partial<OpenCodeConfig>) => Promise<boolean>
    }
    file: {
      read: (path: string) => Promise<string | null>
      write: (path: string, content: string) => Promise<boolean>
    }
  }
  $: {
    exec: (command: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>
  }
}

export interface LogEntry {
  body: {
    service: string
    level: "debug" | "info" | "warn" | "error"
    message: string
    extra?: Record<string, unknown>
  }
}

export interface OpenCodeConfig {
  instructions?: string[]
  permission?: {
    skill?: Record<string, string>
  }
  plugin?: string[]
  mcp?: Record<string, McpServerConfig>
  [key: string]: unknown
}

export interface McpServerConfig {
  type: string
  command: string
  args: string[]
  env?: Record<string, string>
  [key: string]: unknown
}

export interface SkillInfo {
  name: string
  description: string
  path: string
  hasReferences: boolean
  referenceCount: number
}

export interface InstallResult {
  success: boolean
  skillsInstalled: string[]
  skillsSkipped: string[]
  errors: string[]
  warnings: string[]
}

export interface McpServerPackage {
  name: string
  npmPackage: string
  config: Omit<McpServerConfig, "type">
}

export const RECOMMENDED_MCP_SERVERS: McpServerPackage[] = [
  {
    name: "github",
    npmPackage: "@modelcontextprotocol/server-github",
    config: {
      command: "npx",
      args: ["@modelcontextprotocol/server-github"],
      env: { GITHUB_TOKEN: "your_token_here" },
    },
  },
  {
    name: "context7",
    npmPackage: "@upstash/context7",
    config: {
      command: "npx",
      args: ["@upstash/context7"],
    },
  },
  {
    name: "grep",
    npmPackage: "grep",
    config: {
      command: "npx",
      args: ["grep"],
    },
  },
]

export const REMOTE_AGENTS_MD_URL =
  "https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md"

export const OPENCODE_DIR_NAMES = [".config/opencode", ".config/opencode"] as const

export const DEFAULT_SKILLS = [
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
] as const