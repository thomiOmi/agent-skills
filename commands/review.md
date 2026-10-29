---
description: Review code quality, bugs, and architecture for the given scope
agent: senior-developer
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff`

## Your task

Review the following scope thoroughly: $ARGUMENTS

If no scope is given, review the current uncommitted git changes (`git status` + `git diff`).

Process:
1. Clarify scope only if it is ambiguous.
2. Load the `code-style` skill when reviewing code quality.
3. Read all relevant files before forming opinions.
4. Present findings first, grouped by severity: Critical to High to Medium to Low to Info.
5. Every finding must cite a file and line/pattern.
6. Do not implement fixes unless the user asks.
