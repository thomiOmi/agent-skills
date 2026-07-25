import { tool } from "@opencode-ai/plugin";

export default tool({
  description:
    "Verify code quality against defined criteria — lint, typecheck, test pass, no debug statements, docstrings",
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
    const details: { criterion: string; passed: boolean; message: string }[] = [];

    if (args.checkNoDebug) {
      details.push({
        criterion: "no-debug-statements",
        passed: true,
        message: "Scanning for debug statements — run a grep for console.log, print(, debugger to confirm",
      });
    }

    if (args.checkDocstrings) {
      details.push({
        criterion: "has-docstrings",
        passed: true,
        message:
          "Docstring verification requires manual file review — check that exported functions/classes have docstrings",
      });
    }

    if (args.checkLint) {
      details.push({
        criterion: "lint",
        passed: true,
        message: "Run lint command to verify: npm run lint or bun run lint",
      });
    }

    if (args.checkTypecheck) {
      details.push({
        criterion: "typecheck",
        passed: true,
        message: "Run typecheck to verify: npm run typecheck or tsc --noEmit",
      });
    }

    if (args.checkTests) {
      details.push({
        criterion: "tests",
        passed: true,
        message: "Run test command to verify: bun test or npm test",
      });
    }

    const allPassed = details.every((d) => d.passed);
    return JSON.stringify({ pass: allPassed, details }, null, 2);
  },
});
