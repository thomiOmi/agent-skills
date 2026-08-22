import type { Plugin } from "@opencode-ai/plugin";
import taskDecomposer from "../tools/task-decomposer";
import qualityVerifier from "../tools/quality-verifier";

export const AgentSkillsPlugin: Plugin = async () => {
  return {
    tool: {
      "task-decomposer": taskDecomposer,
      "quality-verifier": qualityVerifier,
    },
  };
};
