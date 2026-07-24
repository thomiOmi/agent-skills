# PRD: agent-skills TypeScript Plugin

## 1. Problem Statement

The agent-skills repository currently relies on shell scripts (`install-skills.sh` for Linux/Mac/WSL and `install-skills.ps1` for Windows) to install skills, agents, and configuration into the user's OpenCode CLI setup. This approach has several limitations:

- Cross-platform support requires maintaining two separate installer scripts with different logic and edge cases.
- Users must manually clone the repository and execute an installer script.
- There is no auto-sync mechanism — if a new skill is added to the repository, the user must re-run the installer manually.
- MCP server configuration must be done manually after install.
- There is no integration with the OpenCode plugin ecosystem (`"plugin"` field in `opencode.jsonc`).

## 2. Goals

- Replace the shell/PowerShell installer with a TypeScript-based OpenCode plugin.
- Enable installation with a single config line in `opencode.jsonc`:
  `"plugin": ["@thomio/agent-skills"]`.
- Achieve native cross-platform support (Windows, Linux, macOS) without platform-specific scripts.
- Auto-sync skills from the npm package to the user's config directory on session start.
- Auto-configure MCP servers (github, context7, grep) and permissions in `opencode.jsonc`.
- Keep AGENTS.md content always up-to-date via remote URL or npm package.

## 3. Target Users

- OpenCode CLI users who want productivity agent skills available in their sessions.
- Developers who work across multiple platforms (Windows, Linux, Mac) and want a uniform setup experience.
- Users already familiar with OpenCode's plugin system (`opencode.jsonc` `"plugin"` field).

## 4. User Stories

- **US-1**: As a user, I want to add `"plugin": ["@thomio/agent-skills"]` to my `opencode.jsonc` so that all skills are installed automatically without running a shell script.
- **US-2**: As a user, I want skills to be automatically synced on each OpenCode session so that newly added skills are available without manual re-installation.
- **US-3**: As a Windows user, I want the installation experience to be identical to Linux/Mac — no different terminal commands, no execution policy issues, no platform-specific scripts.
- **US-4**: As a user, I want MCP servers (github, context7, grep) to be auto-configured when the plugin is activated.
- **US-5**: As a maintainer, I want to update skills by publishing a new npm version so that users get the update automatically on their next session.
- **US-6**: As a user, I want the plugin to gracefully handle errors (e.g., missing config directory, permission issues) without crashing OpenCode.

## 5. Functional Requirements

| ID | Requirement | Detail | UNJS Library |
|----|-------------|--------|--------------|
| FR-1 | **Plugin TypeScript package** | Npm package published as `@thomio/agent-skills`. TypeScript strict mode. Bun runtime. | — |
| FR-2 | **Plugin hook: `installation.updated`** | On OpenCode installation update, sync skills from npm package to user's `~/.config/opencode/skills/`. | `pathe`, `fs` |
| FR-3 | **Plugin hook: `session.created`** | On new session, ensure skills are present and up-to-date. Skip if already synced. | `ohash`, `pathe` |
| FR-4 | **Config auto-write: instructions** | Auto-add or update `"instructions"` in `opencode.jsonc` pointing to the remote AGENTS.md URL. | `defu`, `unconfig` |
| FR-5 | **Config auto-write: permissions** | Auto-add or update `"permission.skill.*"` to `"allow"` in `opencode.jsonc`. | `defu`, `unconfig` |
| FR-6 | **MCP auto-config** | Auto-add recommended MCP servers (github, context7, grep) to `opencode.jsonc`. | `defu`, `unconfig` |
| FR-7 | **Cross-platform path resolution** | `pathe` (UNJS) handles path operations: `~/.config/opencode/` on Unix, `%USERPROFILE%\.config\opencode\` on Windows. | `pathe` |
| FR-8 | **Config merging** | `defu` (UNJS) deep-merges plugin defaults with existing user config without overwriting user customizations. | `defu` |
| FR-9 | **HTTP fetching** | `ofetch` (UNJS) fetches remote AGENTS.md, queries npm registry for latest version, checks MCP health. | `ofetch` |
| FR-10 | **URL utilities** | `ufo` (UNJS) parses and manipulates URLs for remote AGENTS.md and npm package endpoints. | `ufo` |
| FR-11 | **Content hashing** | `ohash` (UNJS) hashes skill directory contents to detect changes and skip unnecessary file copies. | `ohash` |
| FR-12 | **Structured logging** | `consola` (UNJS) provides log levels (`info`, `warn`, `error`) with plugin prefix. Replaces `console.log`. | `consola` |
| FR-13 | **Config file resolution** | `unconfig` (UNJS) resolves and parses `opencode.jsonc` robustly (JSONC syntax, file discovery). | `unconfig` |
| FR-14 | **Type coercion** | `destr` (UNJS) converts string config values to correct types (boolean, number, etc.). | `destr` |
| FR-15 | **Graceful error handling** | Plugin errors are caught and logged via `consola.error`. OpenCode session continues even if plugin install fails. | `consola` |

## 6. Non-Functional Requirements

- **NFR-1**: TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`).
- **NFR-2**: Bun runtime — plugin uses Bun APIs and is bundled with Bun.
- **NFR-3**: All UNJS dependencies installed via `bun add` (matching OpenCode's Bun-based architecture).
- **NFR-4**: Plugin package size < 5 MB (suitable for npm publish).
- **NFR-5**: CI pipeline runs TypeScript typecheck (`tsc --noEmit`) and linting.
- **NFR-6**: Unit tests for core install and config functions.
- **NFR-7**: All `AGENTS.md` constraints applied: no emoji in checkmarks, clean markdown list format for "Must do" and "Must not do" sections.
- **NFR-8**: Follow `agentskills.io` specification for SKILL.md frontmatter and directory structure (no changes to existing skills).

## 7. Scope

### In Scope
- TypeScript plugin package with OpenCode hook integration
- Cross-platform skill synchronization (copy from npm package to user config dir)
- `opencode.jsonc` auto-configuration (instructions, permissions, MCP servers)
- Content hashing to avoid unnecessary file copies
- Structured error handling and logging
- CI workflow with typecheck and lint
- Local validation tests
- AGENTS.md cleanup (remove emoji, clean list format)

### Out of Scope
- Custom agents creation (separate feature)
- Custom shortcuts/commands (`/review`, `/plan-feature`)
- Custom plugins (knowledge persistence, notifications, chat export)
- Skill versioning and auto-update mechanism beyond npm publish
- DESIGN.md support
- Skillspector integration
- `opencode.jsonc` schema references to other agentskills.io

## 8. Dependencies (UNJS.io Ecosystem)

The following UNJS.io libraries are used for third-party functionality:

| Package | Purpose |
|---------|---------|
| `pathe` | Cross-platform path joining, resolution, and normalization |
| `defu` | Deep merge of default and user configuration objects |
| `consola` | Structured logging with levels and prefixes |
| `ofetch` | HTTP fetch client with retry and error handling |
| `ufo` | URL parsing, joining, and manipulation |
| `ohash` | Object/content hashing for change detection |
| `unconfig` | Robust config file discovery and parsing |
| `destr` | Safe type coercion from string to typed values |

## 9. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | TBD | MVP: TypeScript plugin with skill sync, config automation, MCP auto-config |