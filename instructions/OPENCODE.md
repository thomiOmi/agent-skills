# OPENCODE.md

Instructions for OpenCode Built-in Tools and Model Execution Guidelines.

---

## Overview

OpenCode provides built-in tools that allow LLMs to interact with the project environment, file system, shell, and user interface. Whenever interacting with a codebase in OpenCode, always make active use of these built-in tools.

---

## Built-in Tools Reference

### File System & Editing Tools

1. **`read`**
   - Purpose: Reads content from files in the codebase.
   - Usage: Always inspect file contents before editing or making assumptions about APIs. Use range parameters for large files.

2. **`edit`**
   - Purpose: Modifies existing files using precise string replacement.
   - Usage: Provide exact search string matches and target replace blocks.

3. **`write`**
   - Purpose: Creates new files or completely overwrites existing ones.
   - Usage: Use when creating new modules, SKILL files, agents, or documentation.

4. **`apply_patch`**
   - Purpose: Applies multi-file patch diffs to the workspace.

### Codebase Search & Intelligence Tools

5. **`grep`**
   - Purpose: Fast content search across the codebase using regex (powered by ripgrep).
   - Usage: Search for function usages, constants, imports, or error strings across files.

6. **`glob`**
   - Purpose: Finds files by pattern matching (e.g. `src/**/*.ts`, `skills/*/SKILL.md`).
   - Usage: Discover file locations and project tree structures.

7. **`lsp`** *(Experimental)*
   - Purpose: Interacts with configured LSP servers (definitions, references, hover, document symbols).

### Execution & Agent Tools

8. **`bash`**
   - Purpose: Executes shell commands (linter, test runner, package manager, git).
   - Usage: Run tests (`bun test`), typechecking (`bun run typecheck`), and linting.

9. **`skill`**
   - Purpose: Loads a `SKILL.md` file dynamically into the conversation context.
   - Usage: Load relevant domain skills before performing domain-specific tasks.

10. **`todowrite`**
    - Purpose: Tracks multi-step tasks during coding sessions.

### Search & Interaction Tools

11. **`webfetch`**
    - Purpose: Fetches and parses content from a specific web URL.

12. **`websearch`**
    - Purpose: Performs web searches (powered by Exa AI) for documentation, library specs, or current technical information.

13. **`question`**
    - Purpose: Asks the user interactive questions with option menus during task execution.

---

## OpenCode V2 Plugin Lifecycle

OpenCode V2 uses a plugin system based on default-exported plugin definitions. Each plugin exports a stable `id` and a `setup(ctx)` function that registers hooks, transforms, tools, and subscriptions.

### Plugin format

```ts
import { Plugin } from "@opencode/plugin";

export const MyPlugin = Plugin.define({
  id: "my-plugin.id",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", async (event) => { ... });
    await ctx.shell.hook("create.before", async (event) => { ... });
    await ctx.session.hook("compaction", async (event) => { ... });
  },
});

export default MyPlugin;
```

### Disabling plugins

Plugins are enabled/disabled through the `plugins` array in `opencode.jsonc`. Prefix a plugin ID with `-` to disable it:

```jsonc
{
  "plugins": ["*", "-opencode.provider.*", "opencode.provider.openai", "-my-plugin.id"]
}
```

A later ID re-enables an earlier wildcard-disabled plugin. Two built-in plugins cannot be removed: `opencode.config.policy` and `opencode.provider.opencode`.

### Local plugins

V2 discovers local plugins from `.opencode/plugin/` and `.opencode/plugins/`. Use `.opencode/plugins/` for V2 plugin files. Local paths must name directories.

Object form for plugins with options:

```jsonc
{
  "plugins": [
    { "package": "./plugins/local", "options": { "enabled": true } }
  ]
}
```

### No environment variable escape hatches

OpenCode V2 does not consume `OPENCODE_DISABLE_*` environment variables to control plugins. Use the `plugins` config array with the `-` prefix instead.

---

## Guidelines for Models & Providers

- **Always verify before modification**: Always call `read`, `grep`, or `glob` to verify codebase state before attempting modifications.
- **Use exact tool calls**: When invoking tools, ensure all required parameter fields are populated accurately according to the tool schema.
- **Verification Loop**: After modifying files with `edit` or `write`, run tests and linter commands via `bash` to verify correctness.
