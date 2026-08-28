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
- GitHub Actions improvements: CI concurrency + bun cache, PR title validation, commitlint job — 2026-08-28
- Release tooling: changelogen (bun run release / bun run changelog), CHANGELOG.md baseline, git hooks (simple-git-hooks + lint-staged + commitlint) — 2026-08-28

### In Progress

- _(none)_

### Planned

- Agent expansion: researcher, project-manager, data-analyst, product-manager
  Ref: DECISIONS.md — delay until 11 existing agents are stable

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
| 2026-08-28 | Added CI concurrency + bun cache + commitlint job, changelogen release tooling, git hooks, CHANGELOG.md; removed npm publish release workflow |
| 2026-07-26 | Agent Orchestra initial release (11 agents, 15 skills, 2 tools, 10 commands) |
