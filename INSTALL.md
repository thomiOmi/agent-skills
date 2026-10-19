# INSTALL.md

Setup guide for humans. Not read by AI agents.

---

## Current Install Path

The supported distribution path is a local clone of this public repository
followed by the installer:

```bash
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
bun run setup
```

Use `bun run setup:symlink` for live development or `bun run setup:merge` to
preserve global-only items. Package registry distribution and remote source
installation are deferred.

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
2. Creates symlinks for `agents/`, `skills/`, `tools/`, `commands/`, and the global `AGENTS.md` sourced from `instructions/AGENTS.md`
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
2. Overwrites `agents/`, `skills/`, `tools/`, `commands/`, and global `AGENTS.md` sourced from `instructions/AGENTS.md`
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

## Per-Agent Model Overrides

Each agent can run on a different model with provider-specific options.
Overrides work in agent markdown frontmatter or in `opencode.jsonc`.

### In agent frontmatter (agents/*.md)

```yaml
---
name: deep-thinker
description: Complex reasoning specialist
mode: subagent
temperature: 0.1
model: cline/claude-sonnet-4.5
reasoningEffort: high
---
```

- `model` uses the `provider/model-id` format. Omit it to use the session model.
- Any other frontmatter key (for example `reasoningEffort`, `textVerbosity`,
  `top_p`) is passed through to the provider as a model option.
- OpenCode lists available models with `opencode models`.

### In opencode.jsonc (including built-in agents)

```jsonc
{
  "agent": {
    "deep-thinker": {
      "model": "cline/claude-sonnet-4.5",
      "reasoningEffort": "high"
    },
    "plan": {
      "model": "cline/claude-haiku-4.5"
    }
  }
}
```

### Recommended assignments for this orchestra

| Agent | Rationale |
|---|---|
| `deep-thinker` | Strongest reasoning model available - root cause analysis and trade-offs |
| `orchestrator` | Fast, capable model - it only decomposes and delegates |
| `senior-developer` | Strong coding model - architecture and implementation |
| `qa-engineer` | Strong coding model - writes and audits tests |
| `marketing`, `docs-writer` | Mid-tier model - prose quality matters less than speed and cost |

Keep cost down: give the heavy reasoning model only to `deep-thinker` and the
strong coding model to `senior-developer` and `qa-engineer`. Everything else
can ride the default session model.

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

## Deployment Map

Every file and directory in this repo has a specific purpose when installed to `~/.config/opencode/`:

| Source (repo) | Destination (`~/.config/opencode/`) | Purpose |
|---|---|---|
| `instructions/AGENTS.md` | `AGENTS.md` | **Global agent rules** - read by the agent every session. Root `AGENTS.md` remains contributor guidance for this repository. |
| `config/opencode.jsonc` | `opencode.jsonc` | **Global config** - default_agent, permissions, formatters, lsp. |
| `config/tui.jsonc` | `tui.jsonc` | **TUI config** - theme, attention notifications. |
| `agents/*.md` | `agents/*.md` | **20 subagent definitions** - orchestrator, senior-developer, qa-engineer, security-auditor, and domain specialists. |
| `skills/*/` | `skills/*/` & `~/.agents/skills/*/` | **34 skill directories** - SKILL.md + references/. Auto-loaded per task. |
| `tools/*.ts` | `tools/*.ts` | **1 custom tool** - quality-verifier.ts. |
| `commands/*.md` | `commands/*.md` | **17 slash-command shortcuts** - `/ship`, `/fix`, `/plan`, `/review`, `/test`, etc. |
| `plugin/agent-skills.ts` | `plugins/agent-skills.ts` | **OpenCode plugin** - registers custom tools, a compaction hook that preserves TASKS.md state across context compaction, and two tool guard hooks: secrets-scanner (blocks writing hardcoded secrets via write/edit) and tool-guardian (blocks destructive bash commands). |

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
**Stack:** Node.js 22 - TypeScript - PostgreSQL - Next.js 15
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
