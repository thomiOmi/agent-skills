# INSTALL.md

Setup guide for humans. Not read by AI agents.

---

## Current Install Path

The supported distribution path is a local clone of this public repository
followed by the installer. The installer writes only to the OpenCode global
config root (`~/.config/opencode/`). It does not write to `~/.agents/`.

```bash
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
bun run setup
```

`bun run setup` uses merge mode by default. It reads an ownership manifest,
preserves user-modified and unmanaged files, backs up the config root before
writing, and merges `opencode.jsonc` and `tui.jsonc` without discarding your
settings.

Package registry distribution and remote source installation are not
supported.

---

## Install Modes

| Mode | Command | Behavior |
|---|---|---|
| merge | `bun run setup` | Default. Updates managed files, preserves modified and unmanaged files, and deletes stale managed files only when they are unmodified. |
| replace | `bun run src/cli.ts install --mode replace` | Overwrites managed files. Unmanaged paths abort the install unless `--force` is set. |
| symlink | `bun run setup:symlink` | Links repository files into the config root for live editing. Falls back to a copy when symlinks are unavailable. |
| copy | `bun run src/cli.ts install --mode copy` | Deprecated alias for replace. Emits a warning. |

Add `--dry-run` to plan without writing. Add `--force` to replace or symlink
mode to overwrite paths the installer does not own. Add `--skip-backup` to
disable the backup, or `--backup-path <dir>` to write the timestamped backup
inside a custom root.

---

## Installer Options and Environment

| Option | Description |
|---|---|
| `--mode <merge\|replace\|symlink\|copy>` | Install mode. Defaults to merge. `copy` is a deprecated alias for replace. |
| `--dry-run` | Print the plan without writing. Shows creates, updates, deletes, keeps, conflicts, and warnings. |
| `--force` | Overwrite unmanaged paths in replace or symlink mode, proceed on a corrupt manifest, or replace an unparseable config. |
| `--target <dir>` | Install into a different config root. Used for testing; the real config root is untouched. |
| `--source <dir>` | Read from a different local clone. Remote sources are rejected. |
| `--skip-backup` | Do not create a backup. Use only when you already have one. |
| `--backup-path <dir>` | Create the timestamped backup directory inside this root. |
| `--version` | Print the package version. |

Environment overrides:

- `OPENCODE_CONFIG_DIR` sets the config root when `--target` is absent.
- `OPENCODE_BACKUP_DIR` sets the backup root when `--target` is absent.
- `OPENCODE_CONFIG` and `OPENCODE_TUI_CONFIG` are read as config merge sources.
  The installer still writes to the config root.

`--target` also places the default backup under `<target>/backups/` unless
`--backup-path` is given. Nothing outside the target directory is written.

---

## What the Installer Manages

| Source (repo) | Destination (`~/.config/opencode/`) |
|---|---|
| `instructions/AGENTS.md` | `AGENTS.md` |
| `config/opencode.jsonc` | `opencode.jsonc` or an existing `opencode.json` |
| `config/tui.jsonc` | `tui.jsonc` or an existing `tui.json` |
| `agents/*.md` | `agents/*.md` |
| `skills/*/` | `skills/*/` |
| `commands/*.md` | `commands/*.md` |
| `plugin/` | `plugins/` |
| ownership metadata | `.agent-skills-manifest.json` |

`~/.agents/skills/` is not managed. Copies left by older installer versions
are untouched. Remove them manually if you no longer need the compatibility
path.

---

## Ownership Manifest

The installer records every file it owns in
`~/.config/opencode/.agent-skills-manifest.json`. The manifest stores the
SHA-256 hash, install mode, and install timestamp for each managed path.

- First run without a manifest: existing files at shipped paths are adopted,
  updated, and recorded. A backup runs first.
- Later runs: files that match the manifest are updated. Files modified by you
  are preserved in merge mode and become conflicts in replace mode.
- Stale files: a managed file that is no longer shipped is deleted only when
  its content still matches the manifest. Modified stale files are preserved.
- Unmanaged files at shipped paths: preserved in merge mode. Replace and
  symlink modes abort unless `--force` is set.
- A corrupt manifest aborts the install unless `--force` is set.

---

## Backups

Before the first write, the installer copies the config root to
`~/.config/opencode-backups/<timestamp>/`. The backup includes the previous
manifest so the installation can be restored. It excludes `node_modules` and
`backups`.

```bash
cp -r ~/.config/opencode-backups/<timestamp>/. ~/.config/opencode/
```

Use `--backup-path <dir>` to create the timestamped directory under a custom
root instead. Use `--skip-backup` only when you already have a backup.

---

## Config Merge

`opencode.jsonc` and `tui.jsonc` are deep-merged with the templates:

- Your values win. Template values fill only missing keys.
- Arrays are atomic. The installer never merges two arrays element by element.
- Unknown keys and V2 keys such as `permissions`, `plugins`, `providers`,
  `agents`, `mcp`, and `watcher` are preserved.
- `default_agent` and `small_model` are never forced. If you set them, they
  stay as set.
- `instructions` keeps your entries and appends `AGENTS.md` only when missing.
- A top-level `subagent_depth` is migrated to `experimental.subagent_depth`.
- An existing `opencode.json` or `tui.json` is updated in place instead of
  creating a duplicate `.jsonc` file.
- Comments in JSONC files are not preserved when a rewrite is required. The
  installer warns before dropping them.
- An invalid existing config aborts in merge mode unless `--force` is set.

`OPENCODE_CONFIG` and `OPENCODE_TUI_CONFIG` are read as merge sources when set.
The installer still writes to the config root.

---

## opencode.jsonc Template

Reference template installed by the installer. The actual template also
contains a `watcher.ignore` list and commented examples for permissions and MCP
servers.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "plan",
  "experimental": {
    "subagent_depth": 2
  },
  "instructions": ["AGENTS.md"],
  "formatter": true,
  "lsp": true,
  "permissions": [
    { "action": "edit", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "*", "effect": "ask" }
  ]
}
```

---

## Per-Agent Model Overrides

Each agent can run on a different model with provider-specific options.
Overrides work in agent markdown frontmatter or in `opencode.jsonc`.
No agent in this repository pins a model today, so every agent inherits the
session model unless you add an override.

### In agent frontmatter (agents/*.md)

```yaml
---
name: deep-thinker
description: Complex reasoning specialist
mode: subagent
model: anthropic/claude-sonnet-4-5#high
request:
  body:
    temperature: 0.1
---
```

- `model` uses the `provider/model` format with an optional `#variant`
  suffix. Omit it to use the session model.
- The provider must be available in the current project. Built-in provider
  IDs include `anthropic`, `openai`, and `opencode`; a custom provider is
  added under `providers` in `opencode.jsonc` and referenced by its own ID.
- Provider options such as `temperature` and `top_p` belong under
  `request.body`. OpenCode v2 does not accept them as top-level agent fields.
- OpenCode lists available models with `opencode models`.

### In opencode.jsonc (including built-in agents)

```jsonc
{
  "agents": {
    "deep-thinker": {
      "model": "anthropic/claude-sonnet-4-5#high",
      "request": {
        "body": {
          "temperature": 0.1
        }
      }
    },
    "plan": {
      "model": "anthropic/claude-haiku-4-5"
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

Pick the concrete `provider/model` id from `opencode models` on your machine;
the table above describes the tier, not a fixed id.

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
  "permissions": [
    { "action": "skill", "resource": "*", "effect": "allow" },
    { "action": "skill", "resource": "internal-*", "effect": "deny" },
    { "action": "skill", "resource": "experimental-*", "effect": "ask" }
  ]
}
```

- `allow` - skill loads immediately
- `deny` - skill hidden from the agent entirely
- `ask` - user prompted before the skill loads
- Rules run in order and the last matching rule wins

You can also deny the skill action for a specific agent:

```jsonc
{
  "agents": {
    "build": {
      "permissions": [
        { "action": "skill", "resource": "*", "effect": "deny" }
      ]
    }
  }
}
```

### MCP servers

Add local or remote MCP servers under `mcp`. Their tools register under the
normalized `<server-name>_<tool>` name, so they can be denied per agent with
a permission action. Uncommented example (disabled by default):

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
  "permissions": [
    { "action": "my-local-server_*", "resource": "*", "effect": "deny" }
  ],
  "agents": {
    "senior-developer": {
      "permissions": [
        { "action": "my-local-server_*", "resource": "*", "effect": "allow" }
      ]
    }
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
| `config/opencode.jsonc` | `opencode.jsonc` or existing `opencode.json` | **Global config** - default_agent, experimental.subagent_depth, instructions, permissions, formatters, lsp, watcher. |
| `config/tui.jsonc` | `tui.jsonc` or existing `tui.json` | **TUI config** - theme, attention notifications. |
| `agents/*.md` | `agents/*.md` | **20 subagent definitions** - orchestrator, senior-developer, qa-engineer, security-auditor, and domain specialists. |
| `skills/*/` | `skills/*/` | **34 skill directories** - SKILL.md + references/. Auto-loaded per task. |
| `commands/*.md` | `commands/*.md` | **17 slash-command shortcuts** - `/ship`, `/fix`, `/plan`, `/review`, `/test`, etc. |
| `plugin/compaction.ts` | `plugins/compaction.ts` | **Compaction plugin** - registers a V2 session compaction hook that preserves TASKS.md state across context compaction. |
| `plugin/secrets-scanner.ts` | `plugins/secrets-scanner.ts` | **Secrets scanner plugin** - registers a V2 tool hook that blocks write/edit calls containing hardcoded secrets. |
| `plugin/tool-guardian.ts` | `plugins/tool-guardian.ts` | **Tool guardian plugin** - registers a V2 shell hook that blocks destructive shell commands before execution. |
| ownership metadata | `.agent-skills-manifest.json` | **Install manifest** - SHA-256 hashes, modes, and timestamps that drive safe updates and stale-file cleanup. |

The installer does not write `~/.agents/skills/`. Older installs may still have
copies there; they are untouched and can be removed manually.

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

**A file I edited was skipped:**

Merge mode preserves files modified after install. Run with `--dry-run` to
confirm the plan. If you want the shipped version, back up first and run
`bun run src/cli.ts install --mode replace --force`.

**My config comments disappeared:**

JSONC comments are not preserved when the installer rewrites a config. The
installer warns before doing it. Keep a backup or use `--dry-run` to inspect
the plan first.

**Config merge was skipped:**

An invalid `opencode.jsonc` or `opencode.json` aborts merge mode. Fix the
syntax, or pass `--force` to replace it with the merged template after a
backup.

**I want to see what will change:**

```bash
bun run src/cli.ts install --dry-run
```

The dry run prints creates, updates, deletes, keeps, conflicts, and warnings
without writing anything.
