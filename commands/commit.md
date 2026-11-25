---
description: Stage, draft a Conventional Commit message, and commit changes
agent: build
subagent: false
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

The context above comes from trusted shell blocks. `$ARGUMENTS` is never interpolated into a shell command.

## Your task

Create a git commit for the current changes: $ARGUMENTS

1. Load the `git-workflow` skill. If it is unavailable, follow the inline fallback below.
2. Match the repository's commit style from `git log`.
3. Stage relevant files, strictly excluding secrets (`.env`, credentials, API keys).
4. Draft a Conventional Commit message: `type(scope): description`.
5. Run `git commit -m "..."` and show the commit summary.
6. Do not push unless the user explicitly asks.

Inline fallback when `git-workflow` cannot be loaded:

- One logical change per commit.
- Allowed types: feat, fix, refactor, test, docs, chore, perf, ci.
- Lowercase imperative subject, no trailing period, under 72 characters.
- Never stage `.env`, key files, or credentials.
