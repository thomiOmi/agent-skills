---
description: Stage, draft Conventional Commit message, and commit changes
agent: orchestrator
---

Create git commit for current changes: $ARGUMENTS

Workflow:
1. Load `git-workflow` skill.
2. Check `git status`, `git diff`, and recent `git log -10 --oneline` to match repository style.
3. Stage relevant files, strictly excluding secrets (`.env`, credentials, API keys).
4. Draft a Conventional Commit message: `type(scope): description`.
5. Execute `git commit -m "..."` and display commit summary.
6. Do not push unless explicitly requested.
