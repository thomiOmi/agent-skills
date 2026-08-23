# agent-skills

Global AGENTS.md, Agents, and Skills collection for [OpenCode CLI](https://opencode.ai).

---

## Skills

| Skill | Description |
|---|---|
| `task-decomposition` | Multi-file tasks, module reviews, TASKS.md tracking |
| `code-style` | Writing, reviewing, refactoring, auditing any code |
| `api-conventions` | REST, GraphQL, WebSocket design and review |
| `testing` | Unit, integration, snapshot, contract tests, coverage audit |
| `documentation` | README, changelog, ADR, OpenAPI spec |
| `planning` | ERD, system architecture, flowchart, sequence diagram |
| `debugging` | Bug diagnosis, slow queries, root cause analysis |
| `ai-integration` | LLM API, prompt design, RAG, agents, embeddings |
| `sdlc-documentation` | PRD, SDD, user stories, test plan, release notes |
| `git-workflow` | Branching, commits, PR review, merge strategy |
| `security-review` | OWASP, auth audit, input validation, data exposure |
| `database` | Schema design, migrations, query optimization, indexing |
| `data-analysis` | SQL queries, dataset analysis, data modeling, reporting |
| `ui-design` | Design systems, accessibility (WCAG), responsive UI |
| `content-strategy` | Technical writing, marketing copy, SEO optimization |
| `devops-deployment` | CI/CD pipelines, Docker, Kubernetes, infrastructure |

---

## Install & Deploy

### Quick Global Deploy

Deploy agents, skills, commands, tools, and configuration to your global OpenCode setup (`~/.config/opencode/` and `~/.agents/skills/`):

```bash
# Option A: Symlink deployment (recommended for development)
bun run symlink

# Option B: Copy deployment
bun run deploy

# Option C: Incremental sync
bun run sync
```

Dry run options are available for all commands:
`bun run deploy --dry-run` or `bun run deploy --target ./test-dir`

### OpenCode Plugin Registration

Add to your `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@thomiOmi/agent-skills"]
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
├── agents/            # 13 specialized subagents
├── commands/          # 12 slash commands
├── config/            # Global opencode.jsonc & tui.jsonc templates
├── instructions/      # Global AGENTS.md source
├── plugin/            # OpenCode plugin entrypoint
├── tools/             # Custom TypeScript tools
├── src/               # CLI installer tooling
├── tests/             # Test suites
└── skills/            # 16 domain skills
```

---

## Development & Testing

| Command | Description |
|---|---|
| `bun run lint` | Run ESLint to check for code and markdown formatting issues |
| `bun run typecheck` | Run TypeScript compiler type checking |
| `bun test` | Run unit test suites |
| `bun run deploy` | Backup and deploy to global OpenCode configuration |
