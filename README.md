# agent-skills

Global AGENTS.md, Agents, and Skills collection for [OpenCode CLI](https://opencode.ai).

---

## Skills

| Skill | Description |
|---|---|
| `task-decomposition` | Multi-file tasks, module reviews, TASKS.md tracking |
| `code-style` | Syntax, variable naming, docstrings, formatting |
| `code-review` | Pull request review, code smells, audit checklist |
| `code-simplifier` | Simplifying code, guard clauses, dead code removal |
| `tech-debt` | Technical debt identification and remediation plans |
| `api-conventions` | REST, GraphQL, WebSocket design and review |
| `testing` | Unit, integration, snapshot, contract tests |
| `test-planning` | Test plans, quality gates, QA coverage strategies |
| `debugging` | Bug diagnosis, slow queries, root cause analysis |
| `system-design` | Architecture design, data flow, scaling (Anthropic framework) |
| `architecture-decision` | Architecture Decision Records (ADRs) and trade-offs |
| `schema-design` | Relational tables, DDL, normalization, foreign keys |
| `query-optimization` | SQL EXPLAIN plans, composite indexing, N+1 prevention |
| `data-analysis` | SQL queries, dataset analysis, data modeling, reporting |
| `requirements-spec` | Product requirements (PRD), user stories, acceptance criteria |
| `sdlc-documentation` | SDLC specs, user stories, release notes |
| `documentation` | README, changelog, OpenAPI spec, developer guides |
| `git-workflow` | Branching, Conventional Commits, PR descriptions |
| `security-review` | OWASP Top 10, auth audit, input validation |
| `prompt-design` | System prompts, LLM prompt engineering structure |
| `structured-output` | JSON schema, tool calling, defensive parsing |
| `design-md` | Design tokens, color palettes, dark mode themes, DESIGN.md specs |
| `web-accessibility` | WCAG 2.1 compliance, ARIA roles, keyboard nav |
| `copywriting` | Landing page copy, CTAs, marketing formulas |
| `no-ai-slop` | Remove AI slop patterns from writing, detect mode, preserve voice |
| `seo-optimization` | Meta tags, title tags, heading hierarchy, on-page SEO |
| `docker-container` | Dockerfiles, multi-stage builds, non-root security |
| `ci-cd-pipeline` | GitHub Actions, pipeline stages, caching, deploy gates |
| `devops-deployment` | Infrastructure, cloud architecture, monitoring |
| `planning` | Diagramming, sequence flows, ERDs |
| `ui-design` | Frontend components, layouts, responsive UI |
| `content-strategy` | Content calendars, brand voice guidelines |
| `ai-integration` | AI model configuration, embeddings, RAG |
| `database` | Database engine selection, transaction handling |

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
├── agents/            # 16 specialized subagents
├── commands/          # 17 slash commands
├── config/            # Global opencode.jsonc & tui.jsonc templates
├── instructions/      # Global AGENTS.md source
├── plugin/            # OpenCode plugin entrypoint
├── tools/             # Custom TypeScript tools
├── src/               # CLI installer tooling
├── tests/             # Test suites
└── skills/            # 35 atomic domain skills
```

---

## Development & Testing

| Command | Description |
|---|---|
| `bun run lint` | Run ESLint to check for code and markdown formatting issues |
| `bun run typecheck` | Run TypeScript compiler type checking |
| `bun test` | Run unit test suites |
| `bun run setup` | Backup and install to global OpenCode configuration (copy mode) |
