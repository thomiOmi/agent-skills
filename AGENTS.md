# AGENTS.md

Project-level agent instructions for the agent-skills project.
Read this fully at the start of every session.

Priority order (highest to lowest):

```text
1. Global AGENTS.md (~/.config/opencode/AGENTS.md) - always applies
2. Project AGENTS.md (this file) - project context and overrides
3. Subdir AGENTS.md - scoped overrides for a subtree
```

This file configures agent behavior **within this project only**.
When agents are installed to `~/.config/opencode/agents/`, the global AGENTS.md handles cross-project rules. See [OpenCode docs](https://opencode.ai/docs/rules) for details.

All global rules (How to Use, Anti-Hallucination, Code Quality, Commits, Testing, Security) apply automatically from `instructions/AGENTS.md` - they are not duplicated here.

Architectural decisions, conventions, and known issues are in `DECISIONS.md` (loaded automatically via opencode.jsonc instructions).

---

## Commands

Run these from the project root. Never run `bun run publish` locally.

| Command | What it does |
|---|---|
| `bun run typecheck` | TypeScript type check (tsc --noEmit) |
| `bun run lint` | ESLint check all files |
| `bun run lint:fix` | ESLint auto-fix |
| `bun run test` | Run all tests (bun test tests/) |
| `bun test tests/<path>` | Single test file |
| `bun run deploy` | Deploy agents/skills/tools to ~/.config/opencode/ |
| `bun run sync` | Sync config files to ~/.config/opencode/ |
| `bun run symlink` | Create symlinks for live editing |

**Never run locally:**
- `bun run publish` - npm publish is CI-only
- `bun run deploy` without `--dry-run` first

---

## Boundaries

### Always do
- Load `code-style` skill before writing or reviewing code
- Load `testing` skill before writing or reviewing tests
- Load relevant skill before domain-specific work (database, api-conventions, etc.)
- Run `bun run typecheck` and `bun run lint` after any code change
- Read files before editing them
- Use `todowrite` for multi-step tasks

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
- Change version in `package.json` locally (CI handles versioning)

---

## Formatting Rules

- No emoji, emoticons, or decorative Unicode characters
- No em dashes (--) or en dashes (-) - use regular hyphen (-) instead
- No decorative formatting (ASCII art, banners, separator lines with special chars)
- No right arrow (->) or other arrows - use words like "to" or "becomes"
- No checkmark/cross symbols (like [x], (v), etc.) in markdown - use text like "Done" or "Failed"

---

## Agent Selection

Use @agent-name for specific concerns:

- `deep-thinker` - Root cause analysis, complex reasoning, trade-off analysis
  Reason: Low temperature (0.1) produces precise, deterministic output for analytical tasks.
- `brainstormer` - Creative ideation, solution exploration, challenging assumptions
  Reason: High temperature (0.8) encourages diverse ideas and divergent thinking.
- `qa-engineer` - Test writing, coverage analysis, quality gates, bug verification
- `docs-writer` - Technical documentation, README, changelog, ADR
- `security-auditor` - Security review, vulnerability assessment, auth audit
- `devops` - CI/CD, deployment, Docker, infrastructure
- `refactor-planner` - Safe refactoring plans, migration strategies, breaking change detection
- `senior-developer` - Architecture, coding, refactoring, code review
- `ui-ux` - Design system, frontend implementation, accessibility
- `marketing` - Content strategy, SEO, copywriting

For multi-step work, invoke `orchestrator` - it decomposes tasks, delegates to subagents, and verifies results.

---

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
**Global config:** config/opencode.jsonc - config/tui.jsonc (templates - deployed with MCP/LSP merge)
**CLI installer:** src/ (TypeScript + citty - not deployed, runs locally)