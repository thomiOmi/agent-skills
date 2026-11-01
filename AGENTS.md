# AGENTS.md

Project-level agent instructions for the agent-skills project.
Read this file fully at the start of every session, along with project context documents: `PRD.md`, `DECISIONS.md`, `ARCHITECTURE.md`, `TASKS.md`, and `SPEC.md`.
`instructions/AGENTS.md` (global agent rules) and `instructions/OPENCODE.md` (OpenCode built-in tools reference) are available as needed; they are not auto-loaded by the installer and do not need to be read at the start of every session.

## Document Map

Each root document owns a distinct kind of fact. If two documents seem to
disagree, the owner listed here wins - the other document should only
cross-reference it, not repeat the details.

| File | Owns | Read this to find out... |
|---|---|---|
| `README.md` | Public overview, quick install | What this project is and how to install it |
| `INSTALL.md` | Full install reference | Every install mode, deployment map, manifest, config merge rules, per-agent model overrides |
| `AGENTS.md` (this file) | Canonical agent roster, commands, boundaries, formatting rules | Which agents exist, what commands to run, what an agent must never do |
| `PRD.md` | Product goals, personas, requirements, scope | Why this project exists and what is in or out of scope |
| `ARCHITECTURE.md` | System design, diagrams, plugin hooks | How the pieces fit together technically |
| `TASKS.md` | Live state: what is done, in progress, planned, and next | What is already shipped and what is next |
| `DECISIONS.md` | Historical record of architectural choices | Why something was built this way instead of another way |
| `SPEC.md` | Agent Skills format spec | How to author a new skill; how skill specification validation works |

Priority order (highest to lowest):

```text
1. Global AGENTS.md (~/.config/opencode/AGENTS.md) - always applies
2. Project AGENTS.md (this file) - project context and overrides
3. Subdir AGENTS.md - scoped overrides for a subtree
```

This file configures contributor and agent behavior **within this project only**.
The installed `instructions/AGENTS.md` configures cross-project global rules; this file adds repository-specific context and boundaries. See [OpenCode docs](https://opencode.ai/docs/rules) for details.

All global rules (Role & Identity, Anti-Hallucination, Communication, Code Quality, Security, Analysis & Review, Testing, Commits) apply automatically from `instructions/AGENTS.md` - they are not duplicated here.

Architectural decisions, conventions, and known issues are in `DECISIONS.md` (loaded automatically via opencode.jsonc instructions).

---

## Agent Orchestra

Default primary agents: built-in `plan` (analysis) and `build` (implementation). The `orchestrator` subagent handles multi-step coordination.

| Agent | Role | Mode | Key Skills |
|---|---|---|---|
| `orchestrator` | Task decomposition, delegation, verification | subagent | task-decomposition, project-lifecycle, planning, code-review, testing |
| `frontend-developer` | UI implementation, components, client state, styling | subagent | ui-design, frontend-patterns, code-style, testing, debugging, git-workflow |
| `backend-developer` | API endpoints, business logic, auth, server-side integration | subagent | api-conventions, backend-patterns, database, code-style, testing, debugging, git-workflow |
| `software-architect` | System design, ADRs, trade-off analysis, architecture review | subagent | planning, architecture-decision, research-methodology, tech-debt |
| `database-engineer` | Schema design, migrations, indexing, query performance | subagent | database, database-migration, data-analysis, api-conventions, testing |
| `ai-engineer` | Prompt engineering, AI integration, RAG, structured output | subagent | prompt-design, structured-output, ai-integration, code-style, testing |
| `senior-developer` | Tech lead: cross-domain review, standards, glue work, hard debugging | subagent | code-style, code-review, security-review, debugging, testing, api-conventions, database, git-workflow, planning, prompt-design, structured-output |
| `product-manager` | PRDs, feature specs, user stories, roadmap | subagent | sdlc-documentation, task-decomposition |
| `project-manager` | Project planning, milestone tracking, risk, status reports | subagent | task-decomposition, planning, sdlc-documentation |
| `data-analyst` | SQL analysis, reporting, data profiling | subagent | database, data-analysis, code-style |
| `qa-engineer` | Test strategy, coverage, quality gates | subagent | testing, test-planning, debugging |
| `security-auditor` | Security review, auth, vulnerability assessment | subagent | security-review, code-style |
| `devops` | CI/CD, deployment, infrastructure | subagent | devops-deployment |
| `ui-ux` | Design system, frontend, accessibility | subagent | ui-design, design-md |
| `docs-writer` | Technical writing, documentation | subagent | documentation, no-ai-slop, sdlc-documentation |
| `brainstormer` | Creative ideation, solution exploration | subagent | prompt-design, planning, code-style |
| `deep-thinker` | Complex reasoning, root cause analysis | subagent | debugging, tech-debt, code-style, code-review |
| `researcher` | Technical research, comparisons, evidence-based recommendations | subagent | research-methodology, planning |
| `refactor-planner` | Safe refactoring, legacy code migration | subagent | refactor-planner, tech-debt, planning, architecture-decision, code-simplifier |
| `marketing` | Content, SEO, copy, strategy | subagent | content-strategy, copywriting, no-ai-slop, seo-optimization |

Invoke a specialist by asking the orchestrator to delegate to that subagent when you already know who should handle it.

Slash commands live in `commands/` (17 files). Run project scripts via `bun run <script>`; see `package.json` scripts.

---

## Boundaries

### Never do

- Edit files in `~/.config/opencode/` directly (the installer manages them). Reason: the ownership manifest tracks installed files.
- Modify `node_modules/` or `dist/`.
- Do not change the package version manually; use `bun run release` so the version, CHANGELOG.md, release commit, and tag stay consistent.

---

## Git Workflow

### Branch Protection

- **Do not push directly to `main`**. All changes must go through a pull request.
- Create a feature branch from `main` for every change.
- Generate a PR for every feature branch before merging to `main`.
- PR must pass all CI checks (lint, typecheck, test) before merging.
- Do not force-push to `main` or already-merged branches.

---

## Project Context

**Project:** agent-skills
**Type:** OpenCode Agent Orchestra (TypeScript + Bun)
**Stack:** TypeScript, Bun, @opencode/plugin
**Package manager:** bun
**Test runner:** Bun built-in test (`bun test`)
**Linter / formatter:** ESLint + typescript-eslint + @stylistic
**Main branch:** main
**CI:** GitHub Actions (validate-skills.yml)
**Key directories:** agents/ - skills/ - plugin/ - tests/ - src/ - config/
**Do NOT touch:** node_modules/ - dist/
**Agent files:** agents/*.md (source - installed to ~/.config/opencode/agents/)
**Skill files:** skills/*/SKILL.md (source - installed to ~/.config/opencode/skills/)
**Global rules:** instructions/AGENTS.md (source of truth - installed to ~/.config/opencode/AGENTS.md)
**Global config:** config/opencode.jsonc - config/tui.jsonc (templates - installed with config merge)
**Installer modes:** merge (default), replace, symlink
**CLI installer:** src/ (TypeScript + citty - not deployed, runs locally; writes only to the OpenCode config root)
