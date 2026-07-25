# INSTALL.md

Setup guide for humans. Not read by AI agents.

---

## Quick Install

### Plugin (recommended)

Install as an OpenCode plugin — automatic skill sync, MCP config, and cross-platform support.

Edit `~/.config/opencode/opencode.jsonc` (or `opencode.json`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["@thomiOmi/agent-skills"],
}
```

That is it. The plugin automatically syncs all 12 skills, configures remote AGENTS.md instructions, sets skill permissions, and auto-configures recommended MCP servers (github, context7, grep). Works the same on Windows, Linux, and macOS.

See [OpenCode Plugins docs](https://opencode.ai/docs/plugins) for details.

---

## opencode.jsonc Template (v2)

Full reference template — add only what you need:

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

- `"plugins"` — array of plugin package names (was `"plugin"` string)
- `"mcp.servers"` — MCP servers nested under `mcp.servers` (was flat `"mcp"` top-level key)
- `"environment"` — for MCP env vars (was `"env"`)
- `"permissions"` — array of `{action, resource, effect}` objects (was `"permission.skill.*"` map)

---

## Per-Project Setup

### Option 1 — Run `/init` inside OpenCode

```shell
/init
```

OpenCode scans the important files in your repo, asks targeted questions when needed, and creates or updates AGENTS.md with concise project-specific guidance.

### Option 2 — Create manually

Create `AGENTS.md` at the project root — fill in only the Project Context section:

```markdown
# AGENTS.md

**Project:** my-app
**Stack:** Node.js 22 · TypeScript · PostgreSQL · Next.js 15
**Package manager:** bun
**Test runner:** bun test
**Linter / formatter:** oxlint + oxfmt
**Main branch:** main
**CI:** GitHub Actions — see .github/workflows/
**Key directories:** src/ · tests/ · skills/
**Do NOT touch:** legacy/ · generated/
```

All global rules from the global AGENTS.md apply automatically.

### Option 3 — Monorepo with glob patterns

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
4. Check skill permissions — `deny` hides skills from agent

**AGENTS.md not loading:**

1. Run `what rules are you following?` in OpenCode to verify
2. Check `instructions` field in `opencode.jsonc`
3. For remote URL — verify the URL is accessible (5s timeout)

**Windows execution policy error:**

PowerShell execution policy can block script execution. Set it with:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
