import type { Plugin } from "@opencode-ai/plugin";

export const AgentSkillsPlugin: Plugin = async () => {
  return {
    event: async ({ event }) => {
      if (event.type === "installation.updated" || event.type === "session.created") {
        return;
      }
    },
  };
};
