---
description: Inspect and update tasks in TASKS.md
agent: general
---

Manage tasks in TASKS.md: $ARGUMENTS

Workflow:
1. Read `TASKS.md` in the current working directory.
2. If `TASKS.md` does not exist, ask before creating it because the project may define a different task document.
3. Treat `Roadmap` as the canonical top-level section, with `Done`, `In Progress`, and `Planned` subsections, plus a separate `Backlog` section for unscheduled work.
4. Summarize active tasks, pending blockers, and completed items using the existing headings.
5. Add, update, or complete tasks based on $ARGUMENTS without replacing unrelated roadmap or backlog entries.
