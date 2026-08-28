# Tasks

Roadmap and backlog for the agent-skills project.

---

## Roadmap

### Done

- Agent Orchestra rewrite with verification loop — 2026-07-25
- 11 specialized agents with routing in orchestrator prompt — 2026-07-25
  - orchestrator, senior-developer, ui-ux, marketing, qa-engineer, devops, security-auditor, brainstormer, deep-thinker, docs-writer, refactor-planner
- 15 skills covering code, testing, security, design, devops, AI, planning, documentation — 2026-07-26
- 2 custom tools: task-decomposer.ts, quality-verifier.ts — 2026-07-26
- 10 slash commands: /ship, /fix, /plan, /review, /test, /commit, /docs, /explain, /brainstorm, /security — 2026-07-26
- Plugin registration (agent-skills.ts) for OpenCode v2 — 2026-07-26
- Clean em dash/emoji/arrow characters across 100+ files — 2026-07-29
- Formatting rules and Boundaries section in AGENTS.md — 2026-07-29
- Move DECISIONS.md to root, add ARCHITECTURE.md + TASKS.md — 2026-07-29
- Agent expansion: researcher + project-manager with research-methodology skill — 2026-08-28
  - Note: data-analyst and product-manager from the original plan already existed in the roster

### In Progress

- _(none)_

### Planned

- GitHub Actions improvements beyond validate-skills.yml
  Ref: PRD.md section 11 Out of Scope — planned after stabilization

---

## Backlog

Catatan personal yang belum dijadwalkan (bukan bagian dari roadmap):

- [ ]
- [ ]
- [ ]

---

## Change History

| Date | Change |
|---|---|
| 2026-07-29 | Created TASKS.md with Roadmap + Backlog |
| 2026-07-29 | Moved DECISIONS.md from docs/ to root |
| 2026-07-29 | Cleaned em dash/emoji/arrows across repo |
| 2026-07-29 | Added Formatting Rules, Boundaries, Agent Selection to AGENTS.md |
| 2026-08-28 | Added researcher + project-manager agents, research-methodology skill, updated routing and docs |
| 2026-08-28 | Fixed skill and command counts in PRD and README |
| 2026-08-28 | Added lint-staged and commitlint configs so the git hooks work |
| 2026-07-26 | Agent Orchestra initial release (11 agents, 15 skills, 2 tools, 10 commands) |
