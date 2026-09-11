# agent-skills

Global AGENTS.md, Agents, and Skills collection for [OpenCode CLI](https://opencode.ai).

---

## Skills

Skills are grouped by SDLC phase — pick the group that matches what you are doing right now.

### 📋 Plan & Architect

| Skill | Description |
|---|---|
| `task-decomposition` | Multi-file tasks, module reviews, TASKS.md tracking |
| `planning` | Architecture design, diagrams, ERDs, ARCHITECTURE.md |
| `architecture-decision` | Architecture Decision Records (ADRs) and trade-offs |
| `sdlc-documentation` | SDLC specs, PRDs, user stories, acceptance criteria, release notes |
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

Install agents, skills, commands, tools, and configuration into your global OpenCode setup (`~/.config/opencode/` and `~/.agents/skills/`):

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

### Install via bunx (after npm publish)

```bash
bunx @thomiomi/agent-skills@latest install
```

### OpenCode Plugin Registration

Add to your `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@thomiomi/agent-skills"]
}
```

---

## Per-Project Setup

Run `/init` inside OpenCode to auto-generate a project-level `AGENTS.md`.

Or create `AGENTS.md` manually at the project root:

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
```

---

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
├── agents/            # 20 specialized subagents
├── commands/          # 17 slash commands
├── config/            # Global opencode.jsonc & tui.jsonc templates
├── instructions/      # Global AGENTS.md source
├── plugin/            # OpenCode plugin entrypoint
├── tools/             # Custom TypeScript tools
├── src/               # CLI installer tooling
├── tests/             # Test suites
└── skills/            # 32 atomic domain skills
```

---

## Development & Testing

| Command | Description |
|---|---|
| `bun run lint` | Run ESLint to check for code and markdown formatting issues |
| `bun run typecheck` | Run TypeScript compiler type checking |
| `bun test` | Run unit test suites |
| `bun run setup` | Backup and install to global OpenCode configuration (copy mode) |
