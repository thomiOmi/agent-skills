import { tool } from "@opencode-ai/plugin";
import { decomposeTask } from "../skills/task-decomposition/scripts/task-decomposer";

export default tool({
  description: "Break a complex task into structured subtasks with suggested agent assignments",
  args: {
    task: tool.schema.string().describe("The complex task description to decompose"),
    context: tool.schema.string().optional().describe("Optional context about the project or requirements"),
  },
  async execute(args) {
    const subtasks = decomposeTask(args.task, args.context);
    return JSON.stringify(subtasks, null, 2);
  },
});
