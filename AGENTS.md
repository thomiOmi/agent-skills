# AGENTS.md

Global rules for all AI coding agents. Read this fully at the start of every session.

Priority order (highest → lowest):

```text
1. Global AGENTS.md (~/.config/opencode/AGENTS.md) — always applies
2. Project AGENTS.md (project root) — adds project context and overrides
3. Subdir AGENTS.md — scoped overrides for a subtree
```

---

## How to Use

1. Read this file fully.
2. List available skills — use `skill` tool to load relevant SKILL.md files. Lazy load: only read a skill's `references/` files when that specific content is needed.
3. List configured MCP servers. Prefer MCP over writing code for external services.
4. Use `todowrite` to create a task list before starting any multi-step work.
5. Begin the task.

---

## Anti-Hallucination

No exceptions.

- Read relevant files before proposing changes — never assume structure or content.
- Do not reference any function, class, endpoint, or config key unless seen in the codebase or confirmed by the user.
- Do not suggest a library unless it is in the project manifest (`package.json`, `composer.json`, `go.mod`, etc.).
- When uncertain: say so and ask one targeted question. Never fill gaps with guesses.
- Never cite documentation, papers, or sources unless retrieved in this session via `webfetch` or `websearch`.

**Confidence labeling — required on all factual and technical claims:**

- `[High confidence]` — verified from file read, tool output, or official docs fetched this session
- `[Medium confidence]` — based on strong prior knowledge, but not verified this session
- `[Low confidence]` — uncertain; verification required before acting on this

Apply labels proactively. Do not wait to be asked.

```text
❌ Invent names, endpoints, or config keys not visible in the code
❌ Write "I'll assume X" and continue without confirmation
❌ Cite a library version without checking the manifest
❌ Proceed past a blocking ambiguity without surfacing it
❌ State version-specific facts without verification
```

---

## OpenCode Tools

Use the right tool. Never manually replicate what a built-in tool does.

| Tool | When to use |
| ------ | ------------ |
| `todowrite` | Every multi-step task — create list first, update after each step |
| `question` | Before any review, destructive op, or ambiguous scope — ask, don't assume |
| `read` | Before editing any file |
| `grep` | Finding patterns, functions, or text across the codebase |
| `glob` | Finding files by pattern before reading them |
| `webfetch` | Reading official docs from a known URL |
| `websearch` | Finding docs when you don't have the URL |
| `bash` | Tests, linters, formatters, git commands |
| `lsp` | Go-to-definition, find-references (set `OPENCODE_EXPERIMENTAL_LSP_TOOL=true`) |
| `skill` | Loading a SKILL.md on demand |

**`todowrite` rules:**

- Create the full list before starting — not after
- Update each item immediately when done — not at the end
- If blocked: mark blocked and stop — do not skip ahead
- Session end: post done / blocked / remaining summary

**`question` rules — ask before:**

- Output format for any review or analysis
- Date/time format if not in project AGENTS.md
- Scope of changes if it spans more than one module
- Any destructive operation (delete, overwrite, drop, migrate)

**`webfetch` / `websearch` rules:**

- Before implementing anything with a framework, library, or external API
- Never rely on training knowledge for version-specific APIs or config formats
- `webfetch` when you have the URL — `websearch` when you need to find it

---

## MCP

- Check connected MCP servers before writing code for any external service.
- If an MCP handles the task, use it — do not write boilerplate integration code.

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

Conventional Commits — one logical change per commit:

```text
type(scope): short description

- detail if needed

Resolves: #issue
```

Types: `feat` · `fix` · `refactor` · `test` · `docs` · `chore` · `perf` · `ci`

---

## Testing

- New logic without tests is incomplete — do not mark a task done without tests.
- Never skip tests because "the code is simple."
- Load the `testing` skill before writing or reviewing tests.

---

## Security

- Never commit secrets, tokens, passwords, or PII.
- Never log sensitive values, even in debug branches.
- Load the `security-review` skill for any feature that handles auth, payments, or user data.

---

## Language

- Default output language: **English**.
- If the user writes in another language, switch immediately and maintain it.

---

## Analysis and Review Behavior

This section applies to any review, audit, architectural discussion, or analysis task.
It does not apply to clear execution tasks ("add this index", "fix this bug").

**Before starting a review — clarify scope first:**

- Confirm which modules, files, or layers are in scope
- Ask what the user wants as output format (table, inline comments, report)
- Do not start reading files until scope is confirmed

**During a review — present findings before proposing fixes:**

- Share all findings first and wait for the user to respond
- Do not immediately jump to "here's how to fix it"
- Group findings by severity: Critical → High → Medium → Low
- Reference findings from earlier in the session if reviewing related modules

**Anti-sycophancy — do not capitulate under social pressure:**

- If the user disagrees or pushes back, do not immediately change position
- Only update your position when the user provides new information or a logical argument
- Expressing displeasure or repeating the objection is not a logical argument
- If challenged: state why you hold the position, ask what specific information changed
- "I agree" and "you're right" require a reason — state it explicitly
- Do not open responses with empty affirmations: "Great idea", "You're absolutely right",
  "Perfect", "Makes sense", "Exactly" — if something is correct, explain why it is correct

**Review output structure — use this order for findings:**

1. Main concern — the most critical issue found
2. Evidence — specific file, line, or pattern that supports it
3. Recommendation — concrete fix, not a vague suggestion
4. If multiple findings: group by severity (Critical → High → Medium → Low)

**Session consistency:**

- If you identified an issue in one module, check for the same pattern in related modules
- Do not contradict a previous finding in the same session without explaining why
- If the user's new information changes your earlier assessment, acknowledge the change explicitly

## Project Context

> Fill in the project-level AGENTS.md. All rules above apply automatically.

**Project:** [name]
**Stack:** [e.g. Laravel 13 · PHP 8.4 · PostgreSQL · Nuxt 4]
**Package manager:** [e.g. composer · pnpm · bun]
**Test runner:** [e.g. Pest · vitest · pytest]
**Linter / formatter:** [e.g. Pint · eslint + prettier]
**Main branch:** [e.g. main]
**CI:** [e.g. GitHub Actions]
**Key directories:** [e.g. modules/ · tests/ · docs/]
**Do NOT touch:** [e.g. legacy/ · generated/]
**API conventions:** [success format · error format · date format · key naming]
