---
description: Commit, push to origin, and open a GitHub pull request
agent: build
subagent: false
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

The context above comes from trusted shell blocks. `$ARGUMENTS` is never interpolated into a shell command.

## Your task

Ship the current branch and open a pull request: $ARGUMENTS

1. Load the `git-workflow` skill. If it is unavailable, follow the inline fallback below.
2. Review staged and unstaged changes, excluding secrets and credentials (`.env`, keys).
3. If on `main`, create a descriptive feature branch (`feat/short-name`).
4. Stage changes and commit with a Conventional Commit message.
5. Push the branch to `origin`.
6. Create the pull request with `gh pr create`, including a summary and a test plan.
7. Return the pull request URL to the user.

Inline fallback when `git-workflow` cannot be loaded:

- One logical change per commit; allowed types: feat, fix, refactor, test, docs, chore, perf, ci.
- Never stage `.env`, key files, or credentials.
- Never force-push to `main` or to an already-merged branch.
- Include what changed, why, and how it was verified in the PR body.
