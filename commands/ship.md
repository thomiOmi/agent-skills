---
description: End-to-end: implement, verify, and prepare for commit/PR
agent: orchestrator
---

Ship this work: $ARGUMENTS

Full workflow:
1. Decompose the request into subtasks.
2. Implement with the appropriate subagents (senior-developer, ui-ux, etc.).
3. Verify with qa-engineer (tests, typecheck, lint as applicable).
4. Run a quick security sanity check if auth/user data/payments are involved.
5. Summarize what changed, how to verify, and remaining follow-ups.
6. Do not push or open a PR unless the user asks.
