---
description: Stage, draft Conventional Commit message, and commit changes
agent: general
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Create git commit for current changes: $ARGUMENTS

1. Load `git-workflow` skill.
2. Match repository commit style from recent `git log`.
3. Stage relevant files, strictly excluding secrets (`.env`, credentials, API keys).
4. Draft a Conventional Commit message: `type(scope): description`.
5. Execute `git commit -m "..."` and display commit summary.
6. Do not push unless explicitly requested.
