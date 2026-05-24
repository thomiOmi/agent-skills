# INSTALL.md

Setup guide for humans. Not read by AI agents.

---

## Quick Install

### Linux / Mac

```bash
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
chmod +x install-skills.sh
./install-skills.sh
```

### Windows (PowerShell)

```powershell
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills

# If blocked by execution policy, run once:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

.\install-skills.ps1
```

### Windows (WSL)

If you use WSL as your primary dev environment:

```bash
cd agent-skills
chmod +x install-skills.sh
./install-skills.sh   # installs inside WSL (~/.config/opencode/)
```

---

## Global Install Layout

After running the install script:

```text
# Linux / Mac
~/.config/opencode/
├── AGENTS.md                    ← global agent rules
├── INSTALL.md                   ← this file
├── opencode.json                ← model + permission + MCP config
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

# Windows
%APPDATA%\opencode\             ← same structure as above
%USERPROFILE%\.claude\          ← Claude Code
%APPDATA%\gemini\               ← Gemini CLI
```

---

## opencode.json Template

```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "instructions": ["~/.config/opencode/AGENTS.md"],
  "permission": {
    "ask": "ask"
  },
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

Add only the MCP servers your project actually needs.
Project-level `opencode.json` overrides or extends global config.

---

## Per-Project Setup

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

---

## Symlink Setup for Multi-Tool Use

```bash
# Cursor
ln -s AGENTS.md .cursorrules

# GitHub Copilot
mkdir -p .github
ln -s ../AGENTS.md .github/copilot-instructions.md

# Gemini CLI (project-level)
ln -s AGENTS.md GEMINI.md

# Aider — pass at runtime
aider --read AGENTS.md
```

Windows (PowerShell, run as Administrator):

```powershell
# Cursor
New-Item -ItemType SymbolicLink -Path .cursorrules -Target AGENTS.md

# GitHub Copilot
New-Item -ItemType Directory -Force .github
New-Item -ItemType SymbolicLink -Path .github\copilot-instructions.md -Target ..\AGENTS.md
```

---

## Finding More Skills

| Source | Best for |
| --- | --- |
| [skills.sh](https://skills.sh) | Browse community skill collections |
| [officialskills.sh](https://officialskills.sh) | Official skills from vendor dev teams (Anthropic, Sentry, Auth0, Apollo, etc.) |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | Curated list, 1000+ skills |

**Before installing any community skill:**

- Always read the SKILL.md content before installing.
- Prefer skills from official vendor accounts or verified publishers.
- Check that the skill's description is specific — vague skills often trigger incorrectly.

---

## Updating Skills

```bash
# Pull latest from GitHub
git pull

# Re-run the installer
./install-skills.sh        # Linux / Mac
.\install-skills.ps1       # Windows
```

The installer overwrites existing files — your `opencode.json` is preserved if it already exists.
