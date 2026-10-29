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
- Load `security-review` skill.
- Audit authentication, authorization, input validation, data exposure, and transport security.
- Check for OWASP Top 10 risks and improper secret handling.
- Report findings categorized by severity (Critical, High, Medium, Low, Info) with concrete evidence and remediation steps.
