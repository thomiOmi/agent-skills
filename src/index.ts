import { consola } from "consola";
import { DEFAULT_SKILLS } from "./types";

const SERVICE_NAME = "agent-skills";

export { AgentSkillsPlugin } from "../plugin/agent-skills";
export type { PluginContext, InstallResult, OpenCodeConfig, SkillInfo, McpServerPackage } from "./types";
export { syncSkills, isAgentSkillsInstalled, getInstallPaths } from "./install";
export { readOpenCodeConfig, ensureInstructions, ensurePermissions, ensureMcpServers } from "./config";
export { getOpenCodeConfigDir } from "./paths";

export const skills = DEFAULT_SKILLS;

consola.info(`[${SERVICE_NAME}] Package loaded`);
