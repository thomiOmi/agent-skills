import { consola } from "consola"
import { getInstallPaths, syncSkills, isAgentSkillsInstalled } from "./install"
import {
  ensureInstructions,
  ensurePermissions,
  ensureMcpServers,
  readOpenCodeConfig,
  hasOpenCodeConfig,
} from "./config"
import type { PluginContext, InstallResult } from "./types"
import { getOpenCodeConfigDir } from "./paths"
import { DEFAULT_SKILLS, RECOMMENDED_MCP_SERVERS, REMOTE_AGENTS_MD_URL } from "./types"

const SERVICE_NAME = "agent-skills"

export { AgentSkillsPlugin } from "../plugin/agent-skills"
export type { PluginContext, InstallResult, OpenCodeConfig, SkillInfo, McpServerPackage } from "./types"
export { syncSkills, isAgentSkillsInstalled, readOpenCodeConfig } from "./install"
export { getInstallPaths, getOpenCodeConfigDir } from "./paths"
export { ensureInstructions, ensurePermissions, ensureMcpServers } from "./config"

export const skills = DEFAULT_SKILLS

consola.info(`[${SERVICE_NAME}] Package loaded`)