# AGENTS.md

Project-level agent instructions for the agent-skills project.
Read this file fully at the start of every session, along with project context documents: `PRD.md`, `DECISIONS.md`, `ARCHITECTURE.md`, `TASKS.md`, and `SPEC.md`.

## Document Map

Each root document owns a distinct kind of fact. If two documents seem to
disagree, the owner listed here wins - the other document should only
cross-reference it, not repeat the details.

| File | Owns | Read this to find out... |
|---|---|---|
| `README.md` | Public overview, quick install | What this project is and how to install it |
| `INSTALL.md` | Full install/deploy reference | Every install option, deployment map, per-agent model overrides |
| `AGENTS.md` (this file) | Canonical agent roster, commands, boundaries, formatting rules | Which agents exist, what commands to run, what an agent must never do |
| `PRD.md` | Product goals, personas, requirements, scope | Why this project exists and what is in or out of scope |
| `ARCHITECTURE.md` | System design, diagrams, eval pipeline, plugin hooks | How the pieces fit together technically |
| `TASKS.md` | Live state: what is done, in progress, planned, and backlogged | What is already shipped and what is next |
| `DECISIONS.md` | Historical record of architectural choices | Why something was built this way instead of another way |
| `SPEC.md` | Agent Skills format spec, eval tooling mechanics | How to author a new skill, how skill evaluation works |
| `EVALUATION.md` | Historical static evaluation and audit snapshot | What an earlier audit assessed; not current project status |

Priority order (highest to lowest):

```text
1. Global AGENTS.md (~/.config/opencode/AGENTS.md) - always applies
2. Project AGENTS.md (this file) - project context and overrides
3. Subdir AGENTS.md - scoped overrides for a subtree
```

This file configures contributor and agent behavior **within this project only**.
The deployed `instructions/AGENTS.md` configures cross-project global rules; this file adds repository-specific context and boundaries. See [OpenCode docs](https://opencode.ai/docs/rules) for details.

All global rules (Role & Identity, Anti-Hallucination, Communication, Code Quality, Security, Analysis & Review, Testing, Commits) apply automatically from `instructions/AGENTS.md` - they are not duplicated here.

Architectural decisions, conventions, and known issues are in `DECISIONS.md` (loaded automatically via opencode.jsonc instructions).

---

## Commands

Run these from the project root. Never run `npm publish` locally.

| Command | What it does |
|---|---|
| `bun run typecheck` | TypeScript type check (tsc --noEmit) |
| `bun run lint --format json` | ESLint check all files (JSON output) |
| `bun run lint:fix` | ESLint auto-fix |
| `bun run test` | Run all tests (bun test tests/) |
| `bun test tests/<path>` | Single test file |
| `bun run changelog` | Regenerate CHANGELOG.md from conventional commits (changelogen, no version bump) |
| `bun run release` | Prepare a release: bump version, update CHANGELOG.md, create a release commit and tag (changelogen) |
| `bun run setup` | Install agents/skills/tools/commands/config to ~/.config/opencode/ (backup, overwrite, config merge) |
| `bun run setup:symlink` | Install via symlinks for live editing |
| `bun run setup:merge` | Install without wiping global-only items |
| `bun run cli` | Run the installer CLI directly from the cloned repository |

**Never run locally:**
- Package registry publication is deferred.
- `bun run setup` without `--dry-run` first

**Git hooks (simple-git-hooks):** pre-commit runs lint-staged, commit-msg runs commitlint, pre-push runs typecheck and tests. If hooks are missing after cloning, run `bunx simple-git-hooks`.

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
| `senior-developer` | Tech lead: cross-domain review, standards, glue work, hard debugging | subagent | code-style, code-review, debugging, testing, api-conventions, database, git-workflow, planning |
| `product-manager` | PRDs, feature specs, user stories, roadmap | subagent | sdlc-documentation, task-decomposition |
| `project-manager` | Project planning, milestone tracking, risk, status reports | subagent | task-decomposition, planning, sdlc-documentation |
| `data-analyst` | SQL analysis, reporting, data profiling | subagent | database, data-analysis, code-style |
| `qa-engineer` | Test strategy, coverage, quality gates | subagent | testing, test-planning, debugging |
| `security-auditor` | Security review, auth, vulnerability assessment | subagent | security-review |
| `devops` | CI/CD, deployment, infrastructure | subagent | devops-deployment |
| `ui-ux` | Design system, frontend, accessibility | subagent | ui-design, design-md |
| `docs-writer` | Technical writing, documentation | subagent | documentation, no-ai-slop, sdlc-documentation |
| `brainstormer` | Creative ideation, solution exploration | subagent | prompt-design, planning, code-style |
| `deep-thinker` | Complex reasoning, root cause analysis | subagent | debugging, tech-debt, code-style |
| `researcher` | Technical research, comparisons, evidence-based recommendations | subagent | research-methodology, planning |
| `refactor-planner` | Safe refactoring, legacy code migration | subagent | tech-debt, planning, architecture-decision, code-simplifier |
| `marketing` | Content, SEO, copy, strategy | subagent | content-strategy, copywriting, no-ai-slop, seo-optimization |

Invoke a specialist directly with `@agent-name` when you already know who should handle it.

**Daily shortcuts (slash commands):**

| Command | Purpose |
|---|---|
| `/ship` | Implement + verify end-to-end |
| `/ship-pr` | Commit, push to origin, and create GitHub PR |
| `/fix` | Diagnose and fix a bug |
| `/plan` | Plan only (no code changes) |
| `/review` | Code review |
| `/refactor` | Plan and execute safe code refactoring |
| `/audit` | Audit codebase for security vulnerabilities |
| `/simplify` | Simplify code logic and flatten conditionals |
| `/test` | Run / improve tests |
| `/tasks` | Manage tasks in TASKS.md |
| `/spec` | Draft feature specs / PRDs |
| `/clean-branches` | Prune stale local git branches |
| `/commit` | Conventional commit from current changes |
| `/explain` | Explain code or system |
| `/brainstorm` | Explore options before coding |
| `/security` | Security audit |
| `/docs` | Write or update docs |

---

## Boundaries

### Always do
- Read `PRD.md`, `DECISIONS.md`, `ARCHITECTURE.md`, `TASKS.md`, and `SPEC.md` at the start of every session
- Load `code-style` skill before writing or reviewing code
- Load `testing` skill before writing or reviewing tests
- Load relevant skill before domain-specific work (database, api-conventions, etc.)
- Run `bun run typecheck` and `bun run lint --format json` after any code change
- Read files before editing them
- Use `todowrite` or `TASKS.md` for multi-step tasks

### Ask first
- Adding new dependencies (npm, bun)
- Schema changes or migrations
- Modifying CI/CD pipeline
- Changing deploy process or config structure
- Deleting files or directories

### Never do
- Edit files in `~/.config/opencode/` directly (they are overwritten by deploy)
  Reason: Source of truth is in this repo; deploy copies from here.
- Modify `node_modules/` or `dist/`
- Add emoji, em dashes, or decorative text to any file
- Skip verification (typecheck + lint + test) before marking a task done
- Do not change the package version manually; use `bun run release` so the
  version, CHANGELOG.md, release commit, and tag stay consistent.

---

## Formatting Rules

- No emoji, emoticons, or decorative Unicode characters
  Exceptions: README.md may use emoji in section headings, and CHANGELOG.md is generated by changelogen and keeps emoji in section headings
- No em dashes (--) or en dashes (-) - use regular hyphen (-) instead
- No decorative formatting (ASCII art, banners, separator lines with special chars)
- No right arrow (->) or other arrows - use words like "to" or "becomes"
- No decorative checkmark or cross glyphs inline in prose (a checkmark or cross character used as a symbol, not as text) - use text like "Done" or "Failed". This does NOT apply to standard GFM task-list checkboxes (`- [ ]` and `- [x]`) used for checklists throughout this repo; those are intentional and stay.
- English only in all repo files (agents, skills, docs, templates, code comments). The sole exception is live discussion with the user, which may use any language the user prefers - discussion language never leaks into committed files.

## Project Context

**Project:** agent-skills
**Type:** OpenCode Agent Orchestra (TypeScript + Bun)
**Stack:** TypeScript, Bun, @opencode-ai/plugin
**Package manager:** bun
**Test runner:** Bun built-in test (`bun test`)
**Linter / formatter:** ESLint + typescript-eslint + @stylistic
**Main branch:** main
**CI:** GitHub Actions (validate-skills.yml)
**Key directories:** agents/ - skills/ - tools/ - plugin/ - tests/ - src/ - config/
**Do NOT touch:** node_modules/ - dist/
**Agent files:** agents/*.md (source - installed to ~/.config/opencode/agents/)
**Skill files:** skills/*/SKILL.md (source - installed to ~/.config/opencode/skills/)
**Custom tools:** tools/*.ts (source - installed to ~/.config/opencode/tools/)
**Global rules:** instructions/AGENTS.md (source of truth - deployed to ~/.config/opencode/AGENTS.md)
**Global config:** config/opencode.jsonc - config/tui.jsonc (templates - deployed with config merge)
**CLI installer:** src/ (TypeScript + citty - not deployed, runs locally)
