import { tool } from "@opencode-ai/plugin";
import { verifyQuality } from "../skills/testing/scripts/quality-verifier";

export default tool({
  description:
    "Verify code quality against defined criteria - lint, typecheck, test pass, no debug statements, docstrings",
  args: {
    files: tool.schema.array(tool.schema.string()).describe("Array of file paths to verify"),
    checkLint: tool.schema.boolean().optional().describe("Check if lint passes"),
    checkTypecheck: tool.schema.boolean().optional().describe("Check if TypeScript typecheck passes"),
    checkTests: tool.schema.boolean().optional().describe("Check if tests pass"),
    checkNoDebug: tool.schema
      .boolean()
      .optional()
      .describe("Check for debug statements (console.log, print, debugger)"),
    checkDocstrings: tool.schema.boolean().optional().describe("Check that all functions/classes have docstrings"),
  },
  async execute(args) {
    const result = verifyQuality(args.files, {
      checkLint: args.checkLint,
      checkTypecheck: args.checkTypecheck,
      checkTests: args.checkTests,
      checkNoDebug: args.checkNoDebug,
      checkDocstrings: args.checkDocstrings,
    });
    return JSON.stringify(result, null, 2);
  },
});
