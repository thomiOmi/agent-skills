# agent-skills

Global AGENTS.md and SKILL.md collection for [OpenCode CLI](https://opencode.ai).

## Skills

| Skill | Triggers on |
|-------|------------|
| `task-decomposition` | "implement", "build", "migrate", multi-file tasks |
| `code-style` | writing, reviewing, or refactoring any code |
| `api-conventions` | REST, GraphQL, WebSocket design and review |
| `testing` | unit, integration, snapshot, contract tests |
| `documentation` | README, changelog, ADR, OpenAPI spec |
| `planning` | ERD, MVP doc, timeline, flowchart, system design |
| `debugging` | bug diagnosis, root cause analysis |
| `ai-integration` | LLM API, prompt design, RAG, agents, embeddings |

## Install

### Option A — Remote (recommended)

AGENTS.md is fetched from GitHub automatically — always up-to-date.

Add to `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "https://raw.githubusercontent.com/thomiOmi/agent-skills/main/AGENTS.md"
  ],
  "permission": {
    "skill": { "*": "allow" }
  }
}
```

Then install skills locally:

```bash
# Linux / Mac / WSL
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
chmod +x install-skills.sh
./install-skills.sh --skills-only
```

```powershell
# Windows
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly
```

### Option B — Full local install

```bash
# Linux / Mac / WSL
./install-skills.sh
```

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1
```

See [INSTALL.md](INSTALL.md) for full config reference, MCP setup, and per-project instructions.

## Per-Project Setup

Run `/init` inside OpenCode to auto-generate a project-level `AGENTS.md`.

Or create it manually — fill in only the Project Context section:

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

## Structure

```text
agent-skills/
├── README.md
├── INSTALL.md
├── SPEC.md
├── AGENTS.md                    ← global agent rules
├── install-skills.sh            ← installer for Linux / Mac / WSL
├── install-skills.ps1           ← installer for Windows
└── skills/
    ├── task-decomposition/
    ├── code-style/
    ├── api-conventions/
    ├── testing/
    ├── documentation/
    ├── planning/
    ├── debugging/
    └── ai-integration/
```

## Updating

```bash
git pull
./install-skills.sh --skills-only     # Linux / Mac / WSL
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly  # Windows
```

If you use **Option A (remote)**, AGENTS.md updates automatically — only re-run when new skills are added.
If you use **Option B (full local)**, re-run the full installer to get AGENTS.md updates and new skills.
