# INSTALL.md

Setup guide for humans. Not read by AI agents.

---

## Quick Install

### Option A - Symlink (recommended)

Create symbolic links from the repo into your global OpenCode config.
Changes in the repo are instantly reflected - no re-deploy needed.

```bash
bun run symlink
```

Dry run:

```bash
bun run symlink --dry-run
```

What it does:

1. Backs up `~/.config/opencode` to `~/.config/opencode-backups/<timestamp>/`
2. Creates symlinks for `agents/`, `skills/`, `tools/`, `commands/`, `AGENTS.md`
3. Writes `opencode.jsonc` with `default_agent: orchestrator` and merges MCP + LSP from your previous config
4. Writes `tui.jsonc` with theme and notification settings

**Requirements:**

- Windows: Developer Mode enabled or run as Administrator (for symlink creation)
- macOS / Linux: standard symlinks - no special permissions needed

Fallback: if symlinks can't be created, the script copies files instead.

### Option B - Full global deploy (copy-based)

Backup your current global OpenCode config, then **overwrite** it from this repo:

```bash
bun run deploy
```

Dry run:

```bash
bun run deploy --dry-run
```

What it does:

1. Full backup to `~/.config/opencode-backups/<timestamp>/` (excludes `node_modules`)
2. Overwrites `agents/`, `skills/`, `tools/`, `commands/`, `AGENTS.md` from this repo
3. Writes `opencode.jsonc` with `default_agent: orchestrator` and **merges MCP + LSP** from the previous config (tokens keep working)
4. Writes `tui.jsonc` (merged with existing)

Restore a backup:

```bash
cp -r ~/.config/opencode-backups/<timestamp>/* ~/.config/opencode/
```

### Incremental sync (agents + skills + tools + commands)

```bash
bun run sync
```

Dry run:

```bash
bun run sync --dry-run
```

Does not wipe third-party items or rewrite `opencode.jsonc` or `tui.jsonc`.

### Plugin (npm package)

Install as an OpenCode plugin when the package is published:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@thomiOmi/agent-skills"]
}
```

See [OpenCode Plugins docs](https://opencode.ai/docs/plugins) for details.

---

## opencode.jsonc Template (v2)

Full reference template - add only what you need:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "shell": "pwsh",

  "instructions": ["https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md"],

  "permissions": [{ "action": "skill", "resource": "*", "effect": "allow" }],

  "plugins": ["@thomiOmi/agent-skills"],

  "mcp": {
    "servers": {
      "github": {
        "type": "local",
        "command": "npx",
        "args": ["@modelcontextprotocol/server-github"],
        "environment": { "GITHUB_TOKEN": "your_token_here" },
      },
      "filesystem": {
        "type": "local",
        "command": "npx",
        "args": ["@modelcontextprotocol/server-filesystem", "/path/to/project"],
      },
      "postgres": {
        "type": "local",
        "command": "npx",
        "args": ["@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost/db"],
      },
      "browser": {
        "type": "local",
        "command": "npx",
        "args": ["@modelcontextprotocol/server-puppeteer"],
      },
    },
  },
}
```

Key changes from v1:

- `"plugins"` - array of plugin package names (was `"plugin"` string)
- `"mcp.servers"` - MCP servers nested under `mcp.servers` (was flat `"mcp"` top-level key)
- `"environment"` - for MCP env vars (was `"env"`)
- `"permissions"` - array of `{action, resource, effect}` objects (was `"permission.skill.*"` map)

---

## Deployment Map

Every file and directory in this repo has a specific purpose when installed
to `~/.config/opencode/`. This table shows the mapping:

| Source (repo) | Destination (`~/.config/opencode/`) | Purpose |
|---|---|---|
| `instructions/AGENTS.md` | `AGENTS.md` | **Global agent rules** - read by the agent every session. Source of truth for the global AGENTS.md. |
| `config/opencode.jsonc` | `opencode.jsonc` | **Global config** - default_agent, shell, permissions, MCP servers. MCP/LSP are merged from previous config so tokens keep working. |
| `config/tui.jsonc` | `tui.jsonc` | **TUI config** - theme, diff_style, attention notifications. Merged with existing. |
| `agents/*.md` | `agents/*.md` | **11 agent definitions** - invoked via `@agent-name` (orchestrator, senior-developer, etc.). |
| `skills/*/` | `skills/*/` | **15 skill directories** - each contains SKILL.md + references/. Auto-loaded per task. |
| `tools/*.ts` | `tools/*.ts` | **2 custom tools** - task-decomposer.ts, quality-verifier.ts. Used by agents for specific tasks. |
| `commands/*.md` | `commands/*.md` | **10 slash-command shortcuts** - `/ship`, `/fix`, `/plan`, `/review`, `/test`, `/commit`, `/docs`, `/explain`, `/brainstorm`, `/security`. |
| `plugin/agent-skills.ts` | `plugins/agent-skills.ts` | **OpenCode plugin** - hooks into the event system. Can also be installed via npm (`plugin: ["@thomiOmi/agent-skills"]`). |
| `AGENTS.md` (root) | - | No. **Not deployed** - project-only. Contains rules specific to agent-skills repo development. |
| `DECISIONS.md` (root) | - | No. **Not deployed** - project-only. Architectural decisions, conventions, known issues. |
| `ARCHITECTURE.md` (root) | - | No. **Not deployed** - project-only. System architecture reference. |
| `TASKS.md` (root) | - | No. **Not deployed** - project-only. Roadmap and backlog. |
| `PRD.md` (root) | - | No. **Not deployed** - project-only. Product requirements. |
| `SPEC.md` (root) | - | No. **Not deployed** - project-only. Agent Skills spec reference. |
| `src/` | - | No. **Not deployed** - CLI installer (TypeScript + citty) for deploy/sync/symlink commands. |
| `scripts/` | - | No. **Not deployed** - custom ESLint plugin for markdown frontmatter validation. |
| `tests/` | - | No. **Not deployed** - test files (if any). |

### Notes

- **All config files** (`config/`, `instructions/`) are **source of truth** - the originals that get copied/merged to global. Do not edit `~/.config/opencode/` directly as it will be overwritten.
- **Plugin** can be installed in two ways: (1) automatically via `bun run deploy`/`bun run symlink` which copies the file to `~/.config/opencode/plugins/`, or (2) manually via `plugin: ["@thomiOmi/agent-skills"]` in config once published to npm.
- **Backup** is always created before deploy - check `~/.config/opencode-backups/` if you need to roll back.

### Option 1 - Run `/init` inside OpenCode

```shell
/init
```

OpenCode scans the important files in your repo, asks targeted questions when needed, and creates or updates AGENTS.md with concise project-specific guidance.

### Option 2 - Create manually

Create `AGENTS.md` at the project root - fill in only the Project Context section:

```markdown
# AGENTS.md

**Project:** my-app
**Stack:** Node.js 22 · TypeScript · PostgreSQL · Next.js 15
**Package manager:** bun
**Test runner:** bun test
**Linter / formatter:** ESLint + typescript-eslint + @stylistic
**Main branch:** main
**CI:** GitHub Actions - see .github/workflows/
**Key directories:** src/ · tests/ · skills/
**Do NOT touch:** legacy/ · generated/
```

All global rules from the global AGENTS.md apply automatically.

### Option 3 - Monorepo with glob patterns

For monorepos, use `opencode.json` with glob patterns instead of duplicating AGENTS.md:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md",
    "packages/*/AGENTS.md",
    "CONTRIBUTING.md",
  ],
}
```

---

## Updating

```bash
git pull
```

Skills and AGENTS.md update automatically on your next OpenCode session after a new npm version is published. Restart OpenCode to trigger the plugin sync.

---

## Troubleshooting

**Skill not showing up:**

1. Verify `SKILL.md` is spelled in ALL CAPS
2. Check frontmatter has `name` and `description`
3. Ensure `name` field matches the directory name exactly
4. Check skill permissions - `deny` hides skills from agent

**AGENTS.md not loading:**

1. Run `what rules are you following?` in OpenCode to verify
2. Check `instructions` field in `opencode.jsonc`
3. For remote URL - verify the URL is accessible (5s timeout)

**Windows execution policy error:**

PowerShell execution policy can block script execution. Set it with:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
