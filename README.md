# agent-skills

Global AGENTS.md, Agents, and Skills collection for [OpenCode CLI](https://opencode.ai).

---

## Skills

Skills are grouped by SDLC phase - pick the group that matches what you are doing right now.

### 📋 Plan & Architect

| Skill | Description |
|---|---|
| `task-decomposition` | Multi-file tasks, module reviews, TASKS.md tracking |
| `planning` | Architecture design, diagrams, ERDs, ARCHITECTURE.md |
| `architecture-decision` | Architecture Decision Records (ADRs) and trade-offs |
| `sdlc-documentation` | SDLC specs, PRDs, user stories, acceptance criteria, release notes |
| `project-lifecycle` | End-to-end project engagement: phases, gates, scope document, client updates |
| `research-methodology` | Research plans, source evaluation, synthesis |

### 🔧 Build & Implement

| Skill | Description |
|---|---|
| `code-style` | Syntax, variable naming, docstrings, formatting |
| `api-conventions` | REST, GraphQL, WebSocket design and review |
| `database` | Database engines, transactions, schema design, query optimization |
| `data-analysis` | SQL queries, dataset analysis, data modeling, reporting |
| `git-workflow` | Branching, branch naming, Conventional Commits, PR descriptions |
| `ui-design` | Frontend components, layouts, responsive UI, WCAG accessibility |
| `frontend-patterns` | Frontend architecture: state ownership, data fetching, rendering strategy |
| `backend-patterns` | Backend structure: layering, transaction boundaries, jobs, idempotency |
| `database-migration` | Safe schema migrations, expand-contract, backfills, rollback paths |
| `design-md` | Design tokens, color palettes, dark mode themes, DESIGN.md specs |
| `config-management` | App configuration: config files, env vars, feature flags, secrets, validation |

### 🤖 AI Integration & Context

| Skill | Description |
|---|---|
| `prompt-design` | System prompts, LLM prompt engineering structure |
| `structured-output` | JSON schema, tool calling, defensive parsing |
| `ai-integration` | AI model configuration, embeddings, RAG |
| `memory-management` | Session handoff, context persistence, memory compaction |

### ✅ Verify & Quality

| Skill | Description |
|---|---|
| `testing` | Unit, integration, snapshot, contract tests |
| `test-planning` | Test plans, quality gates, QA coverage strategies |
| `code-review` | Pull request review, code smells, audit checklist |
| `code-simplifier` | Simplifying code, guard clauses, dead code removal |
| `debugging` | Bug diagnosis, slow queries, root cause analysis |
| `security-review` | OWASP Top 10, auth audit, input validation |

### 🚀 Ship & Release

| Skill | Description |
|---|---|
| `documentation` | README, changelog, OpenAPI spec, developer guides |
| `devops-deployment` | CI/CD pipelines, Docker, deployment infrastructure, monitoring |

### ⚙️ Operate & Maintain

| Skill | Description |
|---|---|
| `tech-debt` | Technical debt identification and remediation plans |

### ✍️ Content & Writing

| Skill | Description |
|---|---|
| `copywriting` | Landing page copy, CTAs, marketing formulas |
| `content-strategy` | Content calendars, brand voice guidelines |
| `seo-optimization` | Meta tags, title tags, heading hierarchy, on-page SEO |
| `no-ai-slop` | Remove AI slop patterns from writing, detect mode, preserve voice |

---

## Install

### Quick Install

Install agents, skills, commands, and configuration into your global OpenCode setup (`~/.config/opencode/` and `~/.agents/skills/`):

```bash
# Option A: Symlink install (recommended for development)
bun run setup:symlink

# Option B: Copy install (backup, overwrite, config merge)
bun run setup

# Option C: Merge install (preserve global-only items)
bun run setup:merge
```

Dry run options are available for all modes:
`bun run setup --dry-run` or `bun run setup --target ./test-dir`

Clone the repository and run the installer locally:

```bash
git clone https://github.com/thomiOmi/agent-skills.git
cd agent-skills
bun run setup
```

See [INSTALL.md](./INSTALL.md) for symlink, merge, dry-run, and restore
options. Package registry distribution is deferred.

---

## Per-Project Setup

Run `/init` inside OpenCode to auto-generate a project-level `AGENTS.md`.

Or create `AGENTS.md` manually at the project root:

```markdown
# AGENTS.md

**Project:** my-app
**Stack:** Node.js 22 - TypeScript - PostgreSQL - Next.js 15
**Package manager:** bun
**Test runner:** bun test
**Linter / formatter:** ESLint + typescript-eslint + @stylistic
**Main branch:** main
**CI:** GitHub Actions
**Key directories:** src/ · tests/ · skills/
```

---

## Structure

```text
agent-skills/
├── AGENTS.md           # Contributor + agent instructions (project context)
├── ARCHITECTURE.md     # System design, diagrams, plugin hooks
├── CHANGELOG.md        # Generated release history (changelogen)
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── DECISIONS.md        # Architectural decisions and audit history
├── EVALUATION.md       # Historical eval snapshot (not current status)
├── INSTALL.md          # Full install and deploy reference
├── LICENSE
├── PRD.md              # Product goals, requirements, scope
├── README.md
├── SECURITY.md
├── SPEC.md             # Agent Skills format spec
├── TASKS.md            # Live state: roadmap, changelog, backlog
├── bun.lock
├── commitlint.config.mjs
├── eslint.config.js
├── opencode.jsonc      # Global config template
├── package.json
├── tsconfig.json
├── .editorconfig
├── .gitignore
├── .github/            # CI workflows, issue and PR templates, dependabot
├── .vscode/            # Editor settings and extension recommendations
├── agents/             # 20 specialized subagents (*.md)
├── commands/           # 17 slash commands (*.md)
├── config/             # Global opencode.jsonc and tui.jsonc templates
├── instructions/       # Global AGENTS.md source
├── plugin/             # OpenCode plugin entrypoint + hooks
│   ├── agent-skills.ts   # Plugin registration (hooks, no custom tools)
│   ├── compaction.ts     # TASKS.md state into compaction prompt
│   ├── secrets-scanner.ts # Blocks writes containing secrets
│   └── tool-guardian.ts  # Blocks destructive bash commands
├── scripts/            # ESLint and frontmatter dev utilities
├── skills/             # 34 atomic domain skills (SKILL.md + resources)
├── src/                # CLI installer tooling (copy/symlink/merge)
└── tests/              # Test suites (bun test)
```

---

## Development & Testing

| Command | Description |
|---|---|
| `bun run lint` | Run ESLint to check for code and markdown formatting issues |
| `bun run typecheck` | Run TypeScript compiler type checking |
| `bun test` | Run unit test suites |
| `bun run setup` | Backup and install to global OpenCode configuration (copy mode) |

## Community

- [Contributing guide](./CONTRIBUTING.md)
- [Security policy](./SECURITY.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)
- [License](./LICENSE)
