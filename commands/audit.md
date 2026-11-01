---
description: Perform a comprehensive security and vulnerability audit on the codebase
agent: security-auditor
---

## Context

- Recent commits: !`git log --oneline -10`
- Current git diff (staged and unstaged changes): !`git diff`

## Your task

Audit codebase for security vulnerabilities: $ARGUMENTS

Requirements:
- Load `security-review` and `code-review` skills.
- Map the repo first: entry points, how data moves, what load the project expects.
- Audit authentication, authorization, input validation, data exposure, and transport security.
- Check for OWASP Top 10 risks and improper secret handling.
- Rank findings by importance.
- Report findings categorized by severity (Critical, High, Medium, Low, Info) with concrete evidence and remediation steps.
- Each finding must say: what the code does, what goes wrong, how to fix it, what happens if you skip it.
- State the verdict: what to fix first.
