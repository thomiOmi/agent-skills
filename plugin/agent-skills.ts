import type { Plugin } from "@opencode-ai/plugin";
import taskDecomposer from "../tools/task-decomposer";
import qualityVerifier from "../tools/quality-verifier";
import { CompactionPlugin } from "./compaction";
import { SecretsScannerPlugin } from "./secrets-scanner";
import { ToolGuardianPlugin } from "./tool-guardian";

export const AgentSkillsPlugin: Plugin = async (ctx) => {
  const compaction = await CompactionPlugin(ctx);
  const secretsScanner = await SecretsScannerPlugin(ctx);
  const toolGuardian = await ToolGuardianPlugin(ctx);

  return {
    "tool": {
      "task-decomposer": taskDecomposer,
      "quality-verifier": qualityVerifier,
    },
    ...compaction,
    // Compose both tool guards into one hook: each module owns a check,
    // this entry runs them in sequence. OpenCode runs hooks from all
    // registered plugins, so this only composes our own modules.
    "tool.execute.before": async (input, output) => {
      await secretsScanner["tool.execute.before"]?.(input, output);
      await toolGuardian["tool.execute.before"]?.(input, output);
    },
  };
};
