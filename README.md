# agent-skills

Global AGENTS.md and SKILL.md collection for [OpenCode CLI](https://opencode.ai).

## Skills

| Skill                | Triggers on                                                 |
| -------------------- | ----------------------------------------------------------- |
| `task-decomposition` | multi-file tasks, module reviews, unclear scope             |
| `code-style`         | writing, reviewing, refactoring, auditing any code          |
| `api-conventions`    | REST, GraphQL, WebSocket design and review                  |
| `testing`            | unit, integration, snapshot, contract tests, coverage audit |
| `documentation`      | README, changelog, ADR, OpenAPI spec                        |
| `planning`           | ERD, system architecture, flowchart, sequence diagram       |
| `debugging`          | bug diagnosis, slow queries, root cause analysis            |
| `ai-integration`     | LLM API, prompt design, RAG, agents, embeddings             |
| `sdlc-documentation` | PRD, SDD, user stories, test plan, release notes            |
| `git-workflow`       | branching, commits, PR review, merge strategy               |
| `security-review`    | OWASP, auth audit, input validation, data exposure          |
| `database`           | schema design, migrations, query optimization, indexing     |

## Install

### Plugin (recommended)

Install as an OpenCode plugin - automatic skill sync, MCP config, and cross-platform support.

Edit `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["@thomiOmi/agent-skills"],
}
```

That is it. The plugin automatically:

- Syncs all skills to `~/.config/opencode/skills/`
- Configures remote AGENTS.md instructions
- Allows all skills by default
- Auto-configures recommended MCP servers (github, context7, grep)
- Works identically on Windows, Linux, and macOS

See [INSTALL.md](INSTALL.md) for full v2 config reference, MCP setup, and per-project instructions.

## Updating

```bash
git pull
```

Skills and AGENTS.md update automatically on your next OpenCode session after a new npm version is published. Restart OpenCode to trigger the plugin sync.

## Per-Project Setup

Run `/init` inside OpenCode to auto-generate a project-level `AGENTS.md`.

Or create it manually at the project root:

```markdown
# AGENTS.md

**Project:** my-app
**Stack:** Node.js 22 · TypeScript · PostgreSQL · Next.js 15
**Package manager:** bun
**Test runner:** bun test
**Linter / formatter:** ESLint + typescript-eslint + @stylistic
**Main branch:** main
**CI:** GitHub Actions
**Key directories:** src/ · tests/ · skills/
**Do NOT touch:** generated/
```

## Structure

```text
agent-skills/
├── README.md
├── INSTALL.md
├── PRD.md
├── SPEC.md
├── AGENTS.md
├── DECISIONS.md
├── ARCHITECTURE.md
├── TASKS.md
├── package.json
├── tsconfig.json
├── agents/
│   ├── orchestrator.md
│   ├── senior-developer.md
│   ├── ui-ux.md
│   ├── marketing.md
│   ├── qa-engineer.md
│   ├── devops.md
│   ├── security-auditor.md
│   ├── brainstormer.md
│   ├── deep-thinker.md
│   ├── docs-writer.md
│   └── refactor-planner.md
├── commands/
│   ├── ship.md
│   ├── fix.md
│   ├── plan.md
│   ├── review.md
│   ├── test.md
│   ├── commit.md
│   ├── docs.md
│   ├── explain.md
│   ├── brainstorm.md
│   └── security.md
├── config/
│   ├── opencode.jsonc
│   └── tui.jsonc
├── instructions/
│   └── AGENTS.md
├── plugin/
│   └── agent-skills.ts
├── tools/
│   ├── task-decomposer.ts
│   └── quality-verifier.ts
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── config.ts
│   ├── install.ts
│   └── paths.ts
├── tests/
│   └── validate-skills.test.ts
├── scripts/
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
    ├── database/
    ├── ui-design/
    ├── content-strategy/
    └── devops-deployment/
```

Each skill follows the [agentskills.io](https://agentskills.io/specification) spec:

```text
[skill-name]/
├── SKILL.md        ← lean metadata + rules + checklist
├── references/     ← detailed guides loaded on-demand
└── assets/         ← templates ready to copy
```

## Linting & Formatting

This project uses [ESLint](https://eslint.org/) with `typescript-eslint` and `@stylistic/eslint-plugin` for linting and formatting.

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `bun run lint`      | Run ESLint to check for errors and warnings       |
| `bun run lint:fix`  | Run ESLint and auto-fix fixable issues            |
| `bun run fmt`       | Run ESLint to format (via stylistic rules + --fix)|
| `bun run fmt:check` | Run ESLint without auto-fix (fails on any error)  |

To format all files: `bun run fmt`
