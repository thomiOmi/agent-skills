# Tasks

Roadmap and backlog for the agent-skills project.

---

## Roadmap

### Done

- Eval harness validity fixes: grading key isolated from executor cwd (`graded/expected_output.txt`), default executor `opencode run --agent build --auto` so candidates execute instead of answering in plan mode - 2026-09-17
- git-workflow 1.2.0: "Defaults Before Clarification" replaces "Clarify Before Acting" (iteration-1 diagnosis: model deferred specific tasks with clarifying questions, 0/7 with vs 7/7 without) - 2026-09-17
- Eval iteration-1 baseline batch: all 33 skills, 79 cases, 158 runs via resumable lane, zero retries (~4.5 hrs); aggregate with_skill 49/79 vs without_skill 53/79; failure causes classified (plan-mode behavior, grading-key contamination, clarify-pattern) - 2026-09-17
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

- Eval batch (2026-09-11, diperbarui 2026-09-15): subset validasi lulus dan sah - task-decomposition 2/2, testing 2/2 (with dan without_skill). Batch penuh 31 skill tersisa gagal dua kali karena kuota model gratis OpenCode Zen (`muse-spark-*-contributor-free`) habis: eksekusi exit 4/107, summary notdone. Pelajaran: 2 lane paralel + tekanan 158 eksekusi memicu rate limit; selalu sekuensial.
- Persiapan relaunch (2026-09-15): lane script v2 resumable siap di `evals/workspace/rec-lane.ps1` - resume check per skill (skip jika summary.json valid dan semua status done), retry 3x per skill dengan jeda 5 menit, delay 15 detik antar skill, lock guard, log `evals/workspace/recovery.status` (teruji: logika skip lulus). Keputusan user: launch manual besok pagi setelah reset kuota via `powershell -NoProfile -ExecutionPolicy Bypass -File evals/workspace/rec-lane.ps1` (estimasi 1.5-2 jam). Ini baseline run terakhir runner assertion-grading: keputusan 2026-09-15 park runner (baseline-only), DeepEval jadi arah iterasi eval berikutnya (lihat DECISIONS.md). Library vercel-labs/agent-eval dievaluasi dan tidak diadopsi (bukan LLM-judge, opencode hanya via Vercel AI Gateway, arsitektur sandbox vitest tidak cocok untuk A/B skill berbasis teks; LLM-judge nanti via DeepEval atau custom judge step). Setelah COMPLETE: `evals/workspace/aggregate.ps1`, sintesis pass rate, re-run skill gagal via `--iteration 2`, Fase 3 (keputusan skill baru + revisi SKILL.md), lalu PR hygiene (TASKS.md + F1 double-space + routing memory-management).

### Planned

- Eval iteration-2 with fixed harness: re-run git-workflow, data-analysis, documentation, code-simplifier, design-md, project-lifecycle (`--iteration 2`); success criteria: git-workflow rises from 0/7 and clarify-pattern absent from outputs; consider DeepEval LLM-judge for wording-vs-quality failure separation

---

## Backlog

Catatan personal yang belum dijadwalkan (bukan bagian dari roadmap):

- [ ] Multi-runtime plugin manifest (.claude-plugin) for cross-harness distribution (AUDIT.md F5)
- [ ] Implement DeepEval as the LLM-judge for catalog evals (chosen direction 2026-09-15, previously deferred 2026-09-08): new `evals/judge/` Python module (uv project, deps = deepeval) that reads `evals/workspace/<skill>/iteration-N/...` outputs and grades them with G-Eval/metrics; integrate the reserved `--judge` flag in `scripts/evals/run-evals.ts` to run prompts then spawn the judge, merging scores into `summary.json`. DECISIONS.md eval tooling entry updated to match: assertion-grading runner parked baseline-only, DeepEval is the next eval iteration. Prereq (sentralisasi eval cases) already done in PR #35.

---

## Change History

| Date | Change |
|---|---|
| 2026-09-17 | Eval iteration-1 baseline completed (33 skills, 79 cases, 158 runs): with_skill 49/79 vs without_skill 53/79; output diagnosis identified plan-mode candidate behavior, grading-key contamination (expected_output.txt in executor cwd), and clarify-deferral pattern (git-workflow 0/7); runner fixed (graded/ isolation, build agent default executor) and git-workflow revised to apply defaults instead of pausing with clarifying questions |
| 2026-09-15 | Parked the assertion-grading eval runner as baseline-only and chose DeepEval as the LLM-judge direction for the next eval iteration (evals/judge/ module, reserved --judge flag); runner and eval cases stay tracked as migration reference, decision recorded in DECISIONS.md |
| 2026-09-11 | Evaluated agent file markup format (XML tags vs markdown headings) against the agentskills.io specification, Anthropic prompting best practices, OpenCode docs, and community agent examples; decision recorded in DECISIONS.md: XML tags retained, agent files treated as system prompts where XML structuring is a recommended technique |
| 2026-09-11 | Normalized devops and security-auditor agent markup to the XML tag convention (role, skills_to_load, quality standards) used by the other 18 agents; content preserved
| 2026-09-11 | Audit fix: sharpened data-analyst role boundary (pure analysis plus migration outcome validation; schema and migration routing to database-engineer), removed duplicate senior-developer row from orchestrator delegation list, synchronized AGENTS.md Key Skills with actual skills_to_load (added frontend-patterns, backend-patterns, debugging, database-migration; removed phantom code-simplifier), clarified refactor-planner as legacy code migration
| 2026-09-11 | Added project-lifecycle skill (7-phase engagement arc, 2 hard gates, scope document with S/M/L milestones, client communication templates, TASKS.md phase state) wired into orchestrator skills_to_load; strengthened code-review to v1.1.0 with Tech Lead Review Priorities (layering, boundaries, duplication, cross-domain consistency, scope discipline) |
| 2026-09-11 | Added frontend-patterns, backend-patterns, database-migration skills (architectural decision patterns per one-skill-per-moment; complements ui-design, api-conventions, database) with eval cases, wired into frontend-developer, backend-developer, database-engineer skills_to_load, updated README catalog |
| 2026-09-08 | Expanded agent roster from 16 to 20 for the agency structure: added frontend-developer, backend-developer, software-architect, database-engineer; reframed senior-developer as tech lead; updated orchestrator delegation list and AGENTS.md Agent Orchestra table (removed dangling quality-verifier reference) |
| 2026-09-08 | Centralized eval case files from skills/*/evals/evals.json to evals/cases/<skill>.json; updated runner, validation tests, and SPEC.md; installer no longer ships dev-time eval data to users |
| 2026-09-08 | Added trigger collision regression tests and trigger dedupe (PR #30), eval runner --limit flag with --judge guard and exit code (PR #31), common pitfalls sections for four thin skills plus audit refresh (PR #32), closed F7 trust-boundary audit item (PR #33) |
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
