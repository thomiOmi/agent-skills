# PRD: agent-skills TypeScript Plugin

## 1. Problem Statement

The agent-skills repository previously relied on shell scripts (`install-skills.sh` for Linux/Mac/WSL and `install-skills.ps1` for Windows) to install skills, agents, and configuration into the user's OpenCode CLI setup. This approach has several limitations:

- Cross-platform support requires maintaining two separate installer scripts with different logic and edge cases.
- Users must manually clone the repository and execute an installer script.
- There is no auto-sync mechanism — if a new skill is added to the repository, the user must re-run the installer manually.
- MCP server configuration must be done manually after install.
- There is no integration with the OpenCode plugin ecosystem (`"plugins"` field in `opencode.jsonc`).

## 2. Goals

- Replace the shell/PowerShell installer with a TypeScript-based OpenCode plugin.
- Enable installation with a single config line in `opencode.jsonc`:
  `"plugins": ["@thomiOmi/agent-skills"]`.
- Achieve native cross-platform support (Windows, Linux, macOS) without platform-specific scripts.
- Auto-sync skills from the npm package to the user's config directory on session start.
- Auto-configure MCP servers (github, context7, grep) and permissions in `opencode.jsonc`.
- Keep AGENTS.md content always up-to-date via remote URL or npm package.

## 3. Target Users

- OpenCode CLI users who want productivity agent skills available in their sessions.
- Developers who work across multiple platforms (Windows, Linux, Mac) and want a uniform setup experience.
- Users already familiar with OpenCode's plugin system (`opencode.jsonc` `"plugins"` field).

## 4. User Stories

- **US-1**: As a user, I want to add `"plugins": ["@thomiOmi/agent-skills"]` to my `opencode.jsonc` so that all skills are installed automatically without running a shell script.
- **US-2**: As a user, I want skills to be automatically synced on each OpenCode session so that newly added skills are available without manual re-installation.
- **US-3**: As a Windows user, I want the installation experience to be identical to Linux/Mac — no different terminal commands, no execution policy issues, no platform-specific scripts.
- **US-4**: As a user, I want MCP servers (github, context7, grep) to be auto-configured when the plugin is activated.
- **US-5**: As a maintainer, I want to update skills by publishing a new npm version so that users get the update automatically on their next session.
- **US-6**: As a user, I want the plugin to gracefully handle errors (e.g., missing config directory, permission issues) without crashing OpenCode.

## 5. Functional Requirements

| ID    | Requirement                             | Detail                                                                                                                                                                                                              | UNJS Library       |
| ----- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| FR-1  | **Plugin TypeScript package**           | Npm package published as `@thomiOmi/agent-skills`. TypeScript strict mode. Bun runtime.                                                                                                                             | —                  |
| FR-2  | **Plugin hook: `installation.updated`** | On OpenCode installation update, sync skills from npm package to user's `~/.config/opencode/skills/`.                                                                                                               | `pathe`, `fs`      |
| FR-3  | **Plugin hook: `session.created`**      | On new session, ensure skills are present and up-to-date. Skip if already synced.                                                                                                                                   | `ohash`, `pathe`   |
| FR-4  | **Config auto-write: instructions**     | Auto-add or update `"instructions"` in `opencode.jsonc` pointing to the remote AGENTS.md URL.                                                                                                                       | `defu`, `unconfig` |
| FR-5  | **Config auto-write: permissions**      | Auto-add or update `"permissions"` array in `opencode.jsonc` with `{action: "skill", resource: "*", effect: "allow"}`.                                                                                              | `defu`, `unconfig` |
| FR-6  | **MCP auto-config**                     | Auto-add recommended MCP servers (github, context7, grep) to `opencode.jsonc` under `"mcp": { "servers": {...} }` format using v2 config keys.                                                                      | `defu`, `unconfig` |
| FR-7  | **Cross-platform path resolution**      | `pathe` (UNJS) handles path operations: `~/.config/opencode/` on Unix, `%USERPROFILE%\.config\opencode\` on Windows.                                                                                                | `pathe`            |
| FR-8  | **Config merging**                      | `defu` (UNJS) deep-merges plugin defaults with existing user config without overwriting user customizations.                                                                                                        | `defu`             |
| FR-9  | **HTTP fetching**                       | `ofetch` (UNJS) fetches remote AGENTS.md, queries npm registry for latest version, checks MCP health.                                                                                                               | `ofetch`           |
| FR-10 | **Content hashing**                     | `ohash` (UNJS) hashes skill directory contents to detect changes and skip unnecessary file copies.                                                                                                                  | `ohash`            |
| FR-11 | **Structured logging**                  | `consola` (UNJS) provides log levels (`info`, `warn`, `error`) with plugin prefix. Replaces `console.log`.                                                                                                          | `consola`          |
| FR-12 | **Config file resolution**              | `unconfig` (UNJS) resolves and parses `opencode.jsonc` robustly (JSONC syntax, file discovery).                                                                                                                     | `unconfig`         |
| FR-13 | **Type coercion**                       | `destr` (UNJS) converts string config values to correct types (boolean, number, etc.).                                                                                                                              | `destr`            |
| FR-14 | **Graceful error handling**             | Plugin errors are caught and logged via `consola.error`. OpenCode session continues even if plugin install fails.                                                                                                   | `consola`          |
| FR-15 | **v2 Config format compliance**         | All config examples, docs, and code must use OpenCode v2 keys: `"plugins"` (not `"plugin"`), `"permissions"` array (not `"permission.skill.*"`), `"mcp.servers"` (not flat `"mcp"`), `"environment"` (not `"env"`). | —                  |

## 6. Non-Functional Requirements

- **NFR-1**: TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`).
- **NFR-2**: Bun runtime — plugin uses Bun APIs and is bundled with Bun.
- **NFR-3**: All UNJS dependencies installed via `bun add` (matching OpenCode's Bun-based architecture).
- **NFR-4**: Plugin package size < 5 MB (suitable for npm publish).
- **NFR-5**: CI pipeline runs TypeScript typecheck (`tsc --noEmit`), oxlint linting, and oxfmt format check.
- **NFR-6**: Unit tests for core install and config functions.
- **NFR-7**: All `AGENTS.md` constraints applied: no emoji in checkmarks, clean markdown list format for "Must do" and "Must not do" sections.
- **NFR-8**: Follow `agentskills.io` specification for SKILL.md frontmatter and directory structure (no changes to existing skills).
- **NFR-9**: Linting via `oxlint` (not eslint); formatting via `oxfmt` (not prettier). Config files: `oxlint.config.ts` and `oxfmt.config.ts`.
- **NFR-10**: VSCode integration via `oxc-vscode` extension with auto-format on save and auto-fix on save.

## 7. Scope

### In Scope

- TypeScript plugin package with OpenCode hook integration
- Cross-platform skill synchronization (copy from npm package to user config dir)
- `opencode.jsonc` auto-configuration (`plugins`, `instructions`, `permissions`, `mcp.servers` — v2 format)
- Content hashing to avoid unnecessary file copies
- Structured error handling and logging
- CI workflow with typecheck, oxlint, and oxfmt format check
- Local validation tests
- AGENTS.md cleanup (remove emoji, clean list format)
- VSCode settings for oxc (lint + format on save)
- `.editorconfig` for consistent editor formatting

### Out of Scope

- Custom agents creation (separate feature)
- Custom shortcuts/commands (`/review`, `/plan-feature`)
- Custom plugins (knowledge persistence, notifications, chat export)
- Skill versioning and auto-update mechanism beyond npm publish
- DESIGN.md support
- Skillspector integration
- `opencode.jsonc` schema references to other agentskills.io
- Shell installer scripts (`install-skills.sh`, `install-skills.ps1`) — removed in favor of plugin-only install

## 8. Tech Stack

| Tool                    | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| **TypeScript**          | Primary language, strict mode                                           |
| **Bun**                 | Runtime, test runner, package manager                                   |
| **OpenCode**            | Target CLI plugin framework (`@opencode-ai/plugin`, `@opencode-ai/sdk`) |
| **oxlint**              | Fast Rust-based TypeScript linter (replaces eslint)                     |
| **oxfmt**               | Rust-based TypeScript formatter (replaces prettier)                     |
| **oxc-vscode**          | VSCode extension for oxlint + oxfmt integration                         |
| **oxlint.config.ts**    | Lint configuration (TypeScript-aware)                                   |
| **oxfmt.config.ts**     | Format configuration (printWidth: 120)                                  |
| **Pathe**               | Cross-platform path joining, resolution, and normalization              |
| **Consola**             | Structured logging with levels and prefixes                             |
| **Defu**                | Deep merge of default and user configuration objects                    |
| **Ofetch**              | HTTP fetch client with retry and error handling                         |
| **Ohash**               | Object/content hashing for change detection                             |
| **Unconfig**            | Robust config file discovery and parsing                                |
| **Destr**               | Safe type coercion from string to typed values                          |
| **Node.js fs/promises** | Native file system operations (read, write, mkdir, copy, delete)        |
| **Node.js os**          | OS-level operations (`homedir()`)                                       |
| **Node.js path**        | Native path operations (supplementary)                                  |

## 9. OpenCode Config Format Reference (v2)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["@thomiOmi/agent-skills"],
  "instructions": ["https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md"],
  "permissions": [{ "action": "skill", "resource": "*", "effect": "allow" }],
  "mcp": {
    "servers": {
      "github": {
        "type": "local",
        "command": "npx",
        "args": ["@modelcontextprotocol/server-github"],
        "environment": { "GITHUB_TOKEN": "your_token_here" },
      },
    },
  },
}
```

**Key differences from v1 format:**

- `"plugins"` — array of plugin package names (was `"plugin"` string)
- `"permissions"` — array of `{action, resource, effect}` objects (was `"permission.skill.*"` map)
- `"mcp.servers"` — MCP servers nested under `mcp.servers` (was flat `"mcp"` top-level key)
- `"environment"` — for MCP env vars (was `"env"`)

## 10. Project Structure

```text
agent-skills/
├── PRD.md
├── AGENTS.md
├── README.md
├── INSTALL.md
├── SPEC.md
├── LICENSE
├── .editorconfig
├── .gitignore
├── oxlint.config.ts
├── oxfmt.config.ts
├── package.json
├── tsconfig.json
├── bun.lock
├── plugin/
│   └── agent-skills.ts
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── config.ts
│   ├── install.ts
│   └── paths.ts
├── tests/
│   └── validate-skills.test.ts
├── .github/
│   └── workflows/
│       └── validate-skills.yml
└── skills/
    ├── task-decomposition/
    ├── code-style/
    ├── api-conventions/
    ├── testing/
    ├── documentation/
    ├── planning/
    ├── debugging/
    ├── ai-integration/
    ├── sdlc-documentation/
    ├── git-workflow/
    ├── security-review/
    └── database/
```

## 11. Dependencies (UNJS.io Ecosystem)

The following UNJS.io libraries are used for third-party functionality:

| Package    | Purpose                                                    | Status in Codebase              |
| ---------- | ---------------------------------------------------------- | ------------------------------- |
| `pathe`    | Cross-platform path joining, resolution, and normalization | ✅ actively used                |
| `defu`     | Deep merge of default and user configuration objects       | ✅ in package.json, check usage |
| `consola`  | Structured logging with levels and prefixes                | ✅ actively used                |
| `ofetch`   | HTTP fetch client with retry and error handling            | ✅ in package.json, check usage |
| `ohash`    | Object/content hashing for change detection                | ✅ in package.json, check usage |
| `unconfig` | Robust config file discovery and parsing                   | ✅ in package.json, check usage |
| `destr`    | Safe type coercion from string to typed values             | ✅ in package.json, check usage |
| `ufo`      | URL parsing, joining, and manipulation                     | ✅ in package.json, check usage |

## 12. Changelog

| Version | Date | Changes                                                                                |
| ------- | ---- | -------------------------------------------------------------------------------------- |
| 0.1.0   | TBD  | MVP: TypeScript plugin with skill sync, config automation (v2 format), MCP auto-config |
