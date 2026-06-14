# agent-skills

Global AGENTS.md and SKILL.md collection for [OpenCode CLI](https://opencode.ai).

## Skills

| Skill | Triggers on |
| ------- | ------------ |
| `task-decomposition` | multi-file tasks, module reviews, unclear scope |
| `code-style` | writing, reviewing, refactoring, auditing any code |
| `api-conventions` | REST, GraphQL, WebSocket design and review |
| `testing` | unit, integration, snapshot, contract tests, coverage audit |
| `documentation` | README, changelog, ADR, OpenAPI spec |
| `planning` | ERD, system architecture, flowchart, sequence diagram |
| `debugging` | bug diagnosis, slow queries, root cause analysis |
| `ai-integration` | LLM API, prompt design, RAG, agents, embeddings |
| `sdlc-documentation` | PRD, SDD, user stories, test plan, release notes |
| `git-workflow` | branching, commits, PR review, merge strategy |
| `security-review` | OWASP, auth audit, input validation, data exposure |
| `database` | schema design, migrations, query optimization, indexing |

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

Or create it manually at the project root:

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
├── AGENTS.md
├── install-skills.sh
├── install-skills.ps1
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

Each skill follows the [agentskills.io](https://agentskills.io/specification) spec:

```text
[skill-name]/
├── SKILL.md        ← lean metadata + rules + checklist
├── references/     ← detailed guides loaded on-demand
└── assets/         ← templates ready to copy
```

## Updating

```bash
git pull
./install-skills.sh --skills-only     # Linux / Mac / WSL
powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly  # Windows
```

If you use **Option A (remote)**, AGENTS.md updates automatically — only re-run when new skills are added.
