# INSTALL.md

Setup guide for humans. Not read by AI agents.

---

## Quick Install

### Option A — Remote (no install needed)

The simplest setup. OpenCode fetches AGENTS.md directly from GitHub every session — always up-to-date automatically.

Edit `~/.config/opencode/opencode.jsonc` (or `opencode.json`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md"
  ]
}
```

Then install skills locally (skills must be local — they are loaded on-demand):

**Linux / Mac / WSL:**

```bash
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
chmod +x install-skills.sh
./install-skills.sh --skills-only   # skip AGENTS.md, only install skills
```

**Windows (PowerShell):**

```powershell
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly
```

---

### Option B — Full local install

Install everything locally. AGENTS.md is served from disk, not GitHub.

**Linux / Mac / WSL:**

```bash
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
chmod +x install-skills.sh
./install-skills.sh
```

**Windows (PowerShell):**

```powershell
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1
```

---

## Global Install Layout

After running the install script:

```
~/.config/opencode/              # Linux / Mac / WSL
%USERPROFILE%\.config\opencode\  # Windows
├── AGENTS.md                    ← global agent rules
├── INSTALL.md                   ← this file
├── opencode.jsonc               ← config (model, permissions, MCP, instructions)
└── skills/
    ├── task-decomposition/      ← multi-step task planning & execution
    │   └── SKILL.md
    ├── code-style/              ← naming, docstrings, inline comments
    │   └── SKILL.md
    ├── api-conventions/         ← REST, GraphQL, WebSocket design
    │   └── SKILL.md
    ├── testing/                 ← unit, integration, snapshot, contract
    │   └── SKILL.md
    ├── documentation/           ← README, changelog, ADR, OpenAPI
    │   └── SKILL.md
    ├── planning/                ← ERD, MVP doc, timeline, flowchart
    │   └── SKILL.md
    ├── debugging/               ← systematic bug diagnosis workflow
    │   └── SKILL.md
    └── ai-integration/          ← LLM API, prompt design, RAG, agents
        └── SKILL.md
```

---

## opencode.jsonc Template

Full reference template — add only what you need:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "shell": "pwsh",  // or "bash", "zsh", "fish"

  // Option A: load AGENTS.md from GitHub (always up-to-date)
  "instructions": [
    "https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md"
  ],

  // Option B: load AGENTS.md from disk (local install)
  // "instructions": ["~/.config/opencode/AGENTS.md"],

  // Load additional project-specific instruction files
  // "instructions": ["CONTRIBUTING.md", "docs/guidelines.md"],

  // Skill permissions — control which skills agents can access
  "permission": {
    "skill": {
      "*": "allow"          // allow all skills by default
      // "experimental-*": "ask",   // prompt before loading experimental skills
      // "internal-*": "deny"       // hide internal skills from agent
    }
  },

  // MCP servers — add only what your project needs
  "mcp": {
    "github": {
      "type": "local",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "your_token_here" }
    },
    "filesystem": {
      "type": "local",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/project"]
    },
    "postgres": {
      "type": "local",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost/db"]
    },
    "browser": {
      "type": "local",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

---

## Per-Project Setup

### Option 1 — Run `/init` inside OpenCode

```
/init
```

OpenCode scans the important files in your repo, asks targeted questions when needed, and creates or updates AGENTS.md with concise project-specific guidance.

### Option 2 — Create manually

Create `AGENTS.md` at the project root — fill in only the Project Context section:

```markdown
# AGENTS.md

**Project:** my-app
**Stack:** Node.js 22 · TypeScript · PostgreSQL · Next.js 15
**Package manager:** pnpm
**Test runner:** vitest
**Linter / formatter:** eslint + prettier
**Main branch:** main
**CI:** GitHub Actions — see .github/workflows/
**Key directories:** src/ · tests/ · docs/
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
    "CONTRIBUTING.md"
  ]
}
```

---

## Skill Permissions

Control which skills are available per-agent in `opencode.jsonc`:

```jsonc
{
  "permission": {
    "skill": {
      "*": "allow",           // allow all by default
      "experimental-*": "ask" // prompt user before loading
    }
  },

  // Override permissions for a specific built-in agent
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "planning": "allow",
          "*": "deny"
        }
      }
    }
  }
}
```

| Permission | Behavior |
|------------|----------|
| `allow` | Skill loads immediately |
| `deny` | Skill hidden from agent, access rejected |
| `ask` | User prompted before loading |

---

## Other AI Tools

AGENTS.md follows a standard format and can be used with other tools manually.
Since this repo is focused on OpenCode CLI, other tools are not installed automatically.

| Tool | How to use AGENTS.md |
|------|---------------------|
| Cursor | Copy or symlink `AGENTS.md` to `.cursorrules` |
| GitHub Copilot | Copy or symlink to `.github/copilot-instructions.md` |
| Gemini CLI | Copy or symlink to `GEMINI.md` |
| Aider | `aider --read AGENTS.md` |
| Claude Code | Place at `~/.claude/AGENTS.md` (global) or project root |

---

## Finding More Skills

| Source | Best for |
|--------|----------|
| [opencode.ai/docs/skills](https://opencode.ai/docs/skills/) | Official skill format reference |
| [skills.sh](https://skills.sh) | Browse community skill collections |
| [officialskills.sh](https://officialskills.sh) | Official skills from vendor dev teams |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | Curated community list |

⚠️ **Before installing any community skill:**

- Always read the SKILL.md content before installing
- Prefer skills from official vendor accounts
- Verify the `name` field matches the directory name
- Check that description is specific — vague descriptions trigger incorrectly

---

## Updating

```bash
# Pull latest
git pull

# Re-run installer
./install-skills.sh        # Linux / Mac / WSL
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1  # Windows
```

If you use **Option A (remote)**, AGENTS.md updates automatically — only re-run the installer when new skills are added.

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

```powershell
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1
```
