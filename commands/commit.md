---
description: Create a Conventional Commit from current staged/unstaged changes
agent: build
---

Create a git commit for the current changes.

Rules:
1. Run `git status`, `git diff`, and `git log -5 --oneline` first.
2. Stage only relevant files — never stage secrets (`.env`, credentials, keys).
3. Write a Conventional Commits message: `type(scope): description`.
4. Keep the subject concise; add a body only if needed.
5. Do not push unless the user explicitly asks.
6. If there is nothing to commit, say so and stop.
