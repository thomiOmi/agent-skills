---
description: Commit, push to origin, and create a GitHub Pull Request
agent: orchestrator
---

Ship branch and open Pull Request: $ARGUMENTS

Workflow:
1. Load `git-workflow` skill.
2. Review staged and unstaged changes, excluding secrets or credentials (`.env`, keys).
3. If on `main`, create a descriptive feature branch (`feat/short-name`).
4. Stage changes and commit with Conventional Commit message.
5. Push branch to `origin`.
6. Create Pull Request using `gh pr create` with summary and test plan.
7. Return PR URL to user.
