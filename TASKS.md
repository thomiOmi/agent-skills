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
- GitHub Actions improvements: CI concurrency + bun cache, commitlint job — 2026-08-28
- Release tooling: changelogen (bun run release / bun run changelog), CHANGELOG.md baseline, git hooks (simple-git-hooks + lint-staged + commitlint) — 2026-08-28
- Agent expansion: researcher + project-manager with research-methodology skill — 2026-08-28
  - Note: data-analyst and product-manager from the original plan already existed in the roster
- Eval coverage: evals.json for 5 skills (task-decomposition, code-style, testing, security-review, git-workflow) with assertion grading in run-evals.ts — 2026-08-30
- no-ai-slop skill: remove 20+ AI slop patterns from prose while preserving voice (edit + detect modes), adapted from petergyang/no-ai-slop (MIT) — 2026-09-04
- Plugin guard hooks: secrets-scanner (blocks hardcoded secrets in write and edit) and tool-guardian (blocks destructive bash commands) in the plugin harness - 2026-09-06
- Conventional git skills: conventional-branch and conventional-commit, deep-dives under git-workflow, wired to senior-developer - 2026-09-06
- debugging skill 2.3.0: Reproduce Before Fix section with bug reproduction brief template - 2026-09-06

### In Progress

- _(none)_

### Planned

- _(none)_

---

## Backlog

Catatan personal yang belum dijadwalkan (bukan bagian dari roadmap):

- [ ] Tighten agent permissions to match DECISIONS.md convention (AUDIT.md F4)
- [ ] Multi-runtime plugin manifest (.claude-plugin) for cross-harness distribution (AUDIT.md F5)

---

## Change History

| Date | Change |
|---|---|
| 2026-07-29 | Created TASKS.md with Roadmap + Backlog |
| 2026-07-29 | Moved DECISIONS.md from docs/ to root |
| 2026-07-29 | Cleaned em dash/emoji/arrows across repo |
| 2026-07-29 | Added Formatting Rules, Boundaries, Agent Selection to AGENTS.md |
| 2026-08-28 | Added CI concurrency + bun cache + commitlint job, changelogen release tooling, git hooks, CHANGELOG.md; removed npm publish release workflow |
| 2026-08-28 | Added researcher + project-manager agents, research-methodology skill, updated routing and docs |
| 2026-08-28 | Refactored installer: single install command with copy/symlink/merge modes, bin entry for bunx, npm package renamed to @thomiomi/agent-skills |
| 2026-08-28 | Implemented unjs ecosystem: c12 config loader, pkg-types version flag, std-env env info, scule naming utils, ufo + giget remote source install |
| 2026-08-28 | Added eval runner (scripts/evals/run-evals.ts), eval validation test, and example evals for task-decomposition |
| 2026-08-28 | Cleared completed GitHub Actions item from roadmap Planned section |
| 2026-08-29 | Added docs/AUDIT.md: skill and agent audit against 5 reference frameworks, with prioritized findings |
| 2026-08-30 | Added evals.json for 5 core skills and assertion grading + pass-rate report in run-evals.ts |
| 2026-08-30 | Tightened agent permissions (read: allow everywhere, bash: ask for content agents) |
| 2026-08-30 | Added trust boundaries to research-methodology and ai-integration, session handoff to task-decomposition |
| 2026-08-31 | Added compaction plugin hook: TASKS.md state preserved across OpenCode context compaction |
| 2026-09-04 | Added no-ai-slop skill (adapted from petergyang/no-ai-slop, MIT), wired to marketing and docs-writer agents, evals.json with edit and detect cases |
| 2026-09-06 | Added plugin guard hooks (secrets-scanner, tool-guardian), conventional-branch and conventional-commit skills with evals, Reproduce Before Fix section in debugging, eval library decision (none needed, LLM-judge deferred) |
| 2026-07-26 | Agent Orchestra initial release (11 agents, 15 skills, 2 tools, 10 commands) |
