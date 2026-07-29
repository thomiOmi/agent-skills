---
description: Security review for auth, input, data exposure, OWASP risks
agent: security-auditor
---

Perform a security review for: $ARGUMENTS

If no scope is given, review recent changes (`git diff`).

Process:
1. Load the `security-review` skill.
2. Focus on auth, input validation, injection, XSS, secrets, and data exposure.
3. Report findings by severity with file evidence.
4. Recommend concrete fixes - do not implement unless asked.
