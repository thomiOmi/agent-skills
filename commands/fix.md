---
description: Diagnose and fix a bug systematically
agent: general
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Recent commits: !`git log --oneline -10`

## Your task

Fix this issue: $ARGUMENTS

Workflow:
1. Reproduce or understand the failure from evidence (error message, logs, failing test, user report).
2. Load the `debugging` skill.
3. Form a hypothesis, then verify with code reads and targeted commands - do not guess.
4. Implement the minimal correct fix.
5. Add or update a regression test when possible.
6. Run relevant tests / typecheck / lint before declaring done.
7. Summarize root cause, fix, and remaining risk.
