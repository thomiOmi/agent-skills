---
description: Inspect and update tasks in TASKS.md
agent: orchestrator
---

Manage tasks in TASKS.md: $ARGUMENTS

Workflow:
1. Read `TASKS.md` in the current working directory.
2. If `TASKS.md` does not exist, initialize it with Active, Waiting On, Someday, and Done sections.
3. Summarize active tasks, pending blockers, and completed items.
4. Add, update, or complete tasks based on $ARGUMENTS.
