# INSTALL.md

Setup guide for humans. Not read by AI agents.

---

## Quick Install

### Option A - Symlink (recommended for local dev)

Create symbolic links from the repo into your global OpenCode config (`~/.config/opencode/` and `~/.agents/skills/`).
Changes in the repo are instantly reflected - no re-install needed.

```bash
bun run setup:symlink
```

Dry run:

```bash
bun run setup:symlink --dry-run
```

What it does:

1. Backs up `~/.config/opencode` to `~/.config/opencode-backups/<timestamp>/`
2. Creates symlinks for `agents/`, `skills/`, `tools/`, `commands/`, `AGENTS.md`
3. Also syncs skills to `~/.agents/skills/` for OpenCode agent-compatible discovery
4. Writes `opencode.jsonc` with `default_agent: plan`
5. Writes `tui.jsonc` with theme and notification settings

---

### Option B - Full install (copy-based)

Backup your current global OpenCode config, then overwrite it from this repo:

```bash
bun run setup
```

Dry run:

```bash
bun run setup --dry-run
```

What it does:

1. Full backup to `~/.config/opencode-backups/<timestamp>/` (excludes `node_modules` and `backups`)
2. Overwrites `agents/`, `skills/`, `tools/`, `commands/`, `AGENTS.md` from this repo
3. Syncs skills to `~/.agents/skills/`
4. Writes `opencode.jsonc` with `default_agent: plan` and merges user settings
5. Writes `tui.jsonc` (merged with existing TUI settings)

Restore a backup:

```bash
cp -r ~/.config/opencode-backups/<timestamp>/* ~/.config/opencode/
```

---

### Option C - Merge install (preserve global-only items)

```bash
bun run setup:merge
```

Copies repo files over the global config without wiping existing custom items and without rewriting `opencode.jsonc` or `tui.jsonc`.

---

### Install via bunx (after npm publish)

Once the package is published to npm, install without cloning this repo:

```bash
bunx @thomiomi/agent-skills@latest install
bunx @thomiomi/agent-skills@latest install --mode symlink
bunx @thomiomi/agent-skills@latest install --mode merge
```

Install from a specific source (local path, git URL, or giget template):

```bash
bunx @thomiomi/agent-skills@latest install --source github:thomiOmi/agent-skills
```

Check the installed version:

```bash
bunx @thomiomi/agent-skills@latest --version
```

Publishing is manual: run `bun run release` to bump the version and tag, then `npm publish --access public`.

---

## Plugin (npm package)

Distribution status:

1. **Local clone (active)** - the primary install path. Clone this repo and run
   `bun run setup` (or `setup:symlink` for live editing). Everything works:
   agents, skills, tools, commands, and the compaction plugin.
2. **GitHub source (requires public repo)** - `install --source github:thomiOmi/agent-skills`
   downloads via the GitHub tarball API without auth, so it only works if the
   repo is public. It currently returns 404 because the repo is private.
3. **npm (not published yet)** - `bunx @thomiomi/agent-skills@latest install`
   and the `"plugin": ["@thomiomi/agent-skills"]` config entry activate only
   after the package owner runs `bun publish` (npm login + 2FA required).

Until npm publish happens, always install from a local clone.

Install as an OpenCode plugin (after publish):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@thomiomi/agent-skills"]
}
```

See [OpenCode Plugins docs](https://opencode.ai/docs/plugins) for details.

---

## opencode.jsonc Template

Full reference template deployed by installer:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "default_agent": "plan",
  "subagent_depth": 2,

  "formatter": true,
  "lsp": true,

  "permission": {
    "edit": "ask",
    "bash": "ask"
  }
}
```

---

## Skill Permissions and MCP Servers

### Skill loading permissions

Control which skills agents can load with wildcard patterns in `opencode.jsonc`
(see [Agent Skills docs](https://opencode.ai/docs/skills/)):

```jsonc
{
  "permission": {
    "skill": {
      "*": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

- `allow` - skill loads immediately
- `deny` - skill hidden from the agent entirely
- `ask` - user prompted before the skill loads

You can also disable the skill tool for a specific agent:

```jsonc
{
  "agent": {
    "build": { "tools": { "skill": false } }
  }
}
```

### MCP servers

Add local or remote MCP servers under `mcp`. Tools register as
`<server-name>_*` so you can disable them per agent with glob patterns.
Uncommented example (disabled by default):

```jsonc
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    },
    "my-local-server": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command"],
      "enabled": true,
      "environment": {
        "MY_ENV_VAR": "value"
      }
    }
  },
  "tools": {
    "my-local-server_*": false
  },
  "agent": {
    "senior-developer": { "tools": { "my-local-server_*": true } }
  }
}
```

MCP servers add to context - enable only what you need.
See [MCP docs](https://opencode.ai/docs/mcp-servers/) for all options.

### Plugin from npm

Once the package is published, plugins load automatically from your config:

```jsonc
{
  "plugin": ["@thomiomi/agent-skills"]
}
```

The package owner publishes with `bun publish` (releases stop at changelog and
tag otherwise).

---

## Deployment Map

Every file and directory in this repo has a specific purpose when installed to `~/.config/opencode/`:

| Source (repo) | Destination (`~/.config/opencode/`) | Purpose |
|---|---|---|
| `instructions/AGENTS.md` | `AGENTS.md` | **Global agent rules** - read by the agent every session. |
| `config/opencode.jsonc` | `opencode.jsonc` | **Global config** - default_agent, permissions, formatters, lsp. |
| `config/tui.jsonc` | `tui.jsonc` | **TUI config** - theme, attention notifications. |
| `agents/*.md` | `agents/*.md` | **16 subagent definitions** - orchestrator, senior-developer, qa-engineer, security-auditor, etc. |
| `skills/*/` | `skills/*/` & `~/.agents/skills/*/` | **34 skill directories** - SKILL.md + references/. Auto-loaded per task. |
| `tools/*.ts` | `tools/*.ts` | **2 custom tools** - task-decomposer.ts, quality-verifier.ts. |
| `commands/*.md` | `commands/*.md` | **17 slash-command shortcuts** - `/ship`, `/fix`, `/plan`, `/review`, `/test`, etc. |
| `plugin/agent-skills.ts` | `plugins/agent-skills.ts` | **OpenCode plugin** - registers custom tools and a compaction hook that preserves TASKS.md state across context compaction. |

---

## Per-Project AGENTS.md Setup

### Option 1 - Run `/init` inside OpenCode

```shell
/init
```

### Option 2 - Create manually at project root

```markdown
# AGENTS.md

**Project:** my-app
**Stack:** Node.js 22 · TypeScript · PostgreSQL · Next.js 15
**Package manager:** bun
**Test runner:** bun test
**Linter / formatter:** ESLint + typescript-eslint + @stylistic
**Main branch:** main
**CI:** GitHub Actions
```

---

## Troubleshooting

**Skill not showing up:**

1. Verify `SKILL.md` is spelled in ALL CAPS
2. Check frontmatter has `name` and `description`
3. Ensure `name` field matches the directory name
4. Check skill permissions - `deny` hides skills from agent

**AGENTS.md not loading:**

1. Check `instructions` field in `opencode.jsonc` or `AGENTS.md` at project root
2. Run `/init` inside OpenCode to regenerate project instructions
