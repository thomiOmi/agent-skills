# AGENTS.md

## Compatibility

Plain Markdown — no proprietary syntax. Works across all major AI coding tools.

| Tool | Reads from |
|------|-----------|
| OpenCode | `~/.config/opencode/AGENTS.md` (global) |
| Claude Code | `~/.claude/AGENTS.md` (global) |
| Cursor | `AGENTS.md` at project root (or `.cursorrules` symlink) |
| GitHub Copilot | `.github/copilot-instructions.md` (symlink or copy) |
| Gemini CLI | `~/.config/gemini/AGENTS.md` (global) or `GEMINI.md` |
| Aider | `aider --read AGENTS.md` |
| Windsurf / Cody | `AGENTS.md` at project root |
| Codex / Devin | `AGENTS.md` at project root |

Priority (highest → lowest):

```
1. Global AGENTS.md   — always applies
2. Project AGENTS.md  — fills [Project Context] only
3. Subdir AGENTS.md   — scoped overrides for a subtree
```

For install layout and MCP configuration, see `INSTALL.md`.

---

## How to Use This File

**At the start of every session:**

1. Read this file fully.
2. List all available skills in the skills directory. Read the SKILL.md for any skill relevant to the current task — use lazy loading: only load a skill's references/ files when that specific content is needed, not all at once.
3. List all configured MCP servers. If the task involves an external service, prefer using an MCP server over writing code to do it manually.
4. If no skill matches the task, apply the global rules in this file only and proceed.
5. Begin the task.

A project-level AGENTS.md only needs to fill in the [Project Context] section —
all rules here apply automatically.

---

## Language

- Default language for all output: **English**.
- If the user writes in another language or explicitly requests one, switch immediately and maintain it for the rest of the session.
- Do not ask about language preferences unless the user has given a mixed signal.

---

## Anti-Hallucination Rules

No exceptions.

**Before acting:**
- Read relevant files before proposing changes — never assume structure or content.
- Do not reference any function, class, endpoint, or config key unless seen in the codebase or stated by the user.
- Do not suggest a library unless it appears in the project manifest (`package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, etc.) or the user confirmed it.

**When uncertain:**
- Say so: "I don't see this in the codebase — can you point me to it?"
- Ask one targeted question. Never fill gaps with guesses.

**Never:**
```
❌ Invent names, endpoints, or config keys not visible in the code
❌ Cite a library version without checking the manifest
❌ Write "I'll assume X" and continue without confirmation
❌ Proceed past a blocking ambiguity without surfacing it
```

---

## Communication

- Concise by default. Detail only when asked.
- Surface blockers immediately — one clarifying question per blocker.
- On blockers: **Stop → Surface → Wait → Resume** from where you stopped.

**Ask before acting on these:**
- Output format for any report, review, or analysis — ask once: "What format do you prefer? (table, list, markdown, inline comments)"
- Date/time format — ask if not defined in project AGENTS.md: "What date format? (ISO 8601, MySQL YYYY-MM-DD HH:mm:ss, Unix timestamp)"
- Scope of changes — confirm before touching more than one module
- Destructive operations — confirm before deleting, overwriting, or migrating data

**Task tracking:**
- When given a plan or checklist, update it as items complete — mark done with ✅, in-progress with 🟡, blocked with 🔴.
- Do not leave a plan stale. If a step is skipped or blocked, explain why.
- At the end of a session, summarize what was completed and what remains.

---

## Code Quality

- All functions, methods, and classes **must** have a docstring or doc comment.
- Complex or non-obvious logic **must** have an inline comment explaining **why**.
- No debug statements (`console.log`, `print`, `debugger`, `pp`, etc.) in committed code.
- No hardcoded secrets or environment-specific values in source files.
- No changes outside the scope of the current task.

---

## Commits

One logical change per commit. Conventional Commits:

```
type(scope): short description

- detail 1
- detail 2

Resolves: #issue
```

Valid types: `feat` · `fix` · `refactor` · `test` · `docs` · `chore`

---

## Testing

- New logic without tests is incomplete.
- Never skip tests because "the code is simple."
- If tests cannot be written, flag it explicitly.

---

## Security

- Never commit API keys, tokens, passwords, or PII.
- Never log sensitive values, even in debug branches.
- Flag any code handling sensitive data for human review.

---

## MCP Usage Rules

Always check available MCP servers before implementing something manually.

| Task | Prefer |
|------|--------|
| Read/write files on disk | filesystem MCP |
| Query a database | database MCP |
| Fetch a URL or search the web | browser or search MCP |
| Interact with GitHub | GitHub MCP |
| Run shell commands | shell MCP |

```
❌ Do not write code to do something an available MCP server already handles
✅ If no MCP covers the task, write the code and note it as a candidate for MCP
```

---

## Project Context

> Fill this section in each project's local AGENTS.md.
> All global rules above apply automatically — only add project-specific info here.

**Project:** [name]
**Stack:** [e.g. Python 3.12 · FastAPI · PostgreSQL · React 18]
**Package manager:** [e.g. uv · pnpm · cargo · bun]
**Test runner:** [e.g. pytest · vitest · go test · jest]
**Linter / formatter:** [e.g. ruff · eslint + prettier · gofmt]
**Main branch:** [e.g. main]
**CI:** [e.g. GitHub Actions — see .github/workflows/]
**Key directories:** [e.g. src/ · tests/ · docs/]
**Do NOT touch:** [e.g. legacy/ · vendor/ · generated/]

---

## Quick Reference

| Rule | Value |
|------|-------|
| Check skills before starting | ✅ Always — lazy load references |
| Check MCP before writing code | ✅ Always |
| Ask before output format | ✅ Always for review/analysis tasks |
| Ask before date format | ✅ If not in project AGENTS.md |
| Update plan/checklist | ✅ Mark ✅🟡🔴 as work progresses |
| Unknown info | Read the file or ask — never guess |
| Docstrings | Required on all functions, methods, classes |
| Inline comments | Required on complex / non-obvious logic |
| Debug statements in commits | ❌ Never |
| Hardcoded secrets | ❌ Never |
| Tests for new logic | ✅ Always |
| Proceeding past a blocker | ❌ Stop and surface it |
| Writing code an MCP handles | ❌ Never |
