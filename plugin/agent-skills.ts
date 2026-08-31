import type { Plugin } from "@opencode-ai/plugin";
import taskDecomposer from "../tools/task-decomposer";
import qualityVerifier from "../tools/quality-verifier";
import { CompactionPlugin } from "./compaction";

export const AgentSkillsPlugin: Plugin = async (ctx) => {
  const compaction = await CompactionPlugin(ctx);

  return {
    tool: {
      "task-decomposer": taskDecomposer,
      "quality-verifier": qualityVerifier,
    },
    ...compaction,
  };
};
