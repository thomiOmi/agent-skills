# AGENTS.md

Project-level agent instructions for the agent-skills project.
Read this fully at the start of every session.

Priority order (highest to lowest):

```text
1. Global AGENTS.md (~/.config/opencode/AGENTS.md) — always applies
2. Project AGENTS.md (this file) — project context and overrides
3. Subdir AGENTS.md — scoped overrides for a subtree
```

This file configures agent behavior **within this project only**.
When agents are installed to `~/.config/opencode/agents/`, the global AGENTS.md handles cross-project rules. See [OpenCode docs](https://opencode.ai/docs/rules) for details.

---

## How to Use

1. Read this file fully.
2. List available skills -- use `skill` tool to load relevant SKILL.md files.
3. List configured MCP servers. Prefer MCP over writing code for external services.
4. Use `todowrite` to create a task list before starting any multi-step work.
5. Begin the task.

---

## Anti-Hallucination

No exceptions.

- Read relevant files before proposing changes -- never assume structure or content.
- Do not reference any function, class, endpoint, or config key unless seen in the codebase or confirmed by the user.
- Do not suggest a library unless it is in the project manifest (`package.json`, `composer.json`, `go.mod`, etc.).
- When uncertain: say so and ask one targeted question. Never fill gaps with guesses.
- Never cite documentation, papers, or sources unless retrieved in this session via `webfetch` or `websearch`.

Must do:

- Read relevant files before proposing changes -- never assume structure or content.
- Do not reference any function, class, endpoint, or config key unless seen in the codebase or confirmed by the user.
- Do not suggest a library unless it is in the project manifest.

Must not do:

- Do not invent names, endpoints, or config keys not visible in the codebase.
- Do not write "I'll assume X" and continue without confirmation.
- Do not cite a library version without checking the manifest.
- Do not proceed past a blocking ambiguity without surfacing it.
- Do not state version-specific facts without verification.
- Do not omit confidence labeling on any factual or technical claim.

**Confidence labeling format:**

- `[High confidence]` -- verified from file read, tool output, or docs fetched this session
- `[Medium confidence]` -- from prior knowledge, not verified this session
- `[Low confidence]` -- uncertain; verify before the user acts on this

---

## Code Quality

- All functions, methods, and classes must have a docstring or doc comment.
- Complex or non-obvious logic must have an inline comment explaining **why**.
- No debug statements in committed code (`console.log`, `print`, `debugger`, etc.).
- No hardcoded secrets or environment-specific values in source files.
- No changes outside the scope of the current task.
- Load the `code-style` skill before writing or reviewing any code.

---

## Commits

Conventional Commits -- one logical change per commit:

```text
type(scope): short description

- detail if needed

Resolves: #issue
```

Types: `feat` · `fix` · `refactor` · `test` · `docs` · `chore` · `perf` · `ci`

---

## Testing

- New logic without tests is incomplete -- do not mark a task done without tests.
- Never skip tests because "the code is simple."
- Load the `testing` skill before writing or reviewing tests.

---

## Security

- Never commit secrets, tokens, passwords, or PII.
- Never log sensitive values, even in debug branches.
- Load the `security-review` skill for any feature that handles auth, payments, or user data.

---

## Project Knowledge

Read `KNOWLEDGE.md` from the project root at the start of every session — it contains active decisions, conventions, and checkpoint state.

---

## Agent Orchestra

This project provides a primary agent with verification loop and specialized subagents:

- `primary` -- Orchestrator. Decomposes tasks, delegates, verifies results.
- `senior-developer` -- Architecture, coding, refactoring, code review.
- `ui-ux` -- Design system, frontend, accessibility.
- `marketing` -- Content, SEO, copy, strategy.
- `qa-engineer` -- Test strategy, coverage, quality gates.
- `devops` -- CI/CD, deployment, infrastructure.
- `security-auditor` -- Security review, auth, vulnerability assessment.
- `brainstormer` -- Creative ideation, solution exploration.
- `deep-thinker` -- Complex reasoning, root cause analysis.
- `docs-writer` -- Technical writing, documentation.
- `refactor-planner` -- Safe refactoring, migration planning.

For full project work, invoke `primary`. For a specific concern, invoke the relevant subagent directly via `@name`.

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
**Key directories:** agents/ · skills/ · tools/ · plugin/ · tests/
**Do NOT touch:** node_modules/ · dist/
**Agent files:** agents/*.md (source — installed to `~/.config/opencode/agents/`)
**Skill files:** skills/*/SKILL.md (source — installed to `~/.config/opencode/skills/`)
**Custom tools:** tools/*.ts (source — installed to `~/.config/opencode/tools/`)
