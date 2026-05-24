# agent-skills

Global AGENTS.md and SKILL.md collection for AI coding agents.
Works with OpenCode, Claude Code, Cursor, GitHub Copilot, Gemini CLI, Aider, Windsurf, and more.

## Skills Included

| Skill | Triggers on |
| ------- | ------------ |
| `task-decomposition` | "implement", "build", "migrate", multi-file tasks |
| `code-style` | writing, reviewing, or refactoring any code |
| `api-conventions` | REST, GraphQL, WebSocket design and review |
| `testing` | unit, integration, snapshot, contract tests |
| `documentation` | README, changelog, ADR, OpenAPI spec |
| `planning` | ERD, MVP doc, timeline, flowchart |
| `debugging` | systematic bug diagnosis workflow |
| `ai-integration` | LLM API usage, prompt design, RAG, agents |

## Install

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
.\install-skills.ps1
```

See [INSTALL.md](INSTALL.md) for full setup, MCP config, and per-project instructions.

## Per-Project Usage

Create `AGENTS.md` at your project root — fill in only the Project Context section:

```markdown
# AGENTS.md

**Project:** my-app
**Stack:** Node.js 22 · TypeScript · PostgreSQL · Next.js 15
**Package manager:** pnpm
**Test runner:** vitest
**Linter / formatter:** eslint + prettier
**Main branch:** main
**CI:** GitHub Actions
**Key directories:** src/ · tests/ · docs/
**Do NOT touch:** generated/
```

All global rules apply automatically.

## Structure

```text
agent-skills/
├── README.md
├── INSTALL.md
├── AGENTS.md                    ← global agent rules
├── install-skills.sh            ← installer for Linux / Mac / WSL
├── install-skills.ps1           ← installer for Windows (PowerShell)
└── skills/
    ├── task-decomposition/
    │   └── SKILL.md
    ├── code-style/
    │   └── SKILL.md
    ├── api-conventions/
    │   └── SKILL.md
    ├── testing/
    │   └── SKILL.md
    ├── documentation/
    │   └── SKILL.md
    ├── planning/
    │   └── SKILL.md
    ├── debugging/
    │   └── SKILL.md
    └── ai-integration/
        └── SKILL.md
```

## Updating

```bash
git pull
./install-skills.sh     # Linux / Mac / WSL
.\install-skills.ps1    # Windows
```
