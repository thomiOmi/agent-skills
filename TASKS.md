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

- Vendor anthropics skill-creator and plugin-dev under `.agents/` and make eval tooling harness-agnostic (approved 2026-09-19, location confirmed by user: `.agents/skills/skill-creator/` and `.agents/plugins/plugin-dev/`):
  - Fase 1: refactor `scripts/evals/` to `evals/src/` (run-evals.ts, grading.ts, targets.ts); update package.json, tsconfig include, test imports, docs. No behavior change. Done 2026-09-19: runner verified identical via dry-run, typecheck/lint/test all pass.
  - Fase 2: vendor skill-creator (skills/skill-creator subtree: SKILL.md, scripts/, agents/, references/, eval-viewer/, assets/, LICENSE) to `.agents/skills/skill-creator/` and plugin-dev (README, agents/, commands/, skills/) to `.agents/plugins/plugin-dev/`; add `.agents/README.md` with upstream commit hashes; add executor shim (`claude -p` to `opencode run --model <pinned> --agent build --auto`); keep vendored grading logic untouched; gitignore `.agents/` from npm publish (dot-dir is already outside package.json `files`). Done 2026-09-21: vendored at upstream c447c32 (skill-creator) and bf7d404 (plugin-dev); shim at `.agents/claude-shim.py` (stream-json forwarding plus text mode, exe resolution for Windows, env override via AGENT_SKILLS_OPENCODE_BIN/AGENT/MODEL); shim text mode verified live; generate_review.py --static and aggregate_benchmark.py smoke-tested offline; .agents/ and evals/workspace added to ESLint globalIgnores; typecheck/lint/test all pass.
  - Fase 3: complete per-mode artifacts in the TS runner per vendored references/schemas.md: `outputs/`, `timing.json`, `grading.json` per run dir; `benchmark.json` via aggregate_benchmark.py format; scaffold `feedback.json`; `history.json` for the improve loop. Done 2026-09-21: new evals/src/artifacts.ts builds grading.json (expectations with evidence, summary with pass_rate, execution_metrics, timing), timing.json, benchmark.json (viewer-compatible: configuration/runs/result nesting plus run_summary delta), and history.json (improve-loop progression, parent chain, current_best); run-evals.ts writes graded/grading.json, graded/timing.json and outputs/output.txt per run dir plus benchmark.json and history.json per iteration (skipped on dry run; resumed runs record timing as unknown via explicit note); executor wall time captured from runPrompt; 8 new unit tests in tests/eval-artifacts.test.ts; offline smoke verified with a dummy executor run plus aggregate_benchmark.py and generate_review.py --static consuming the produced grading.json/timing.json directly.
  - Fase 4: eval target agent support (`--target` flag, `target: "skill" | "agent"` in case files, default skill for backward compat; resolution: `agents/<name>.md` = agent, `skills/<name>/` = skill; with_agent/without_agent mode dirs). Done 2026-09-21: targets.ts gained EvalTarget/AgentMode/RunMode types, modesForTarget, resolveEvalTarget (agents/<name>.md vs skills/<name>/) and the optional case-file `target` field; run-evals.ts resolves targets per file (CLI `--target` filters by the declared target type, skipping non-matching case files), validates target existence before any executor spend with a wrong-type hint (no identical A/B pairs), wraps agent prompts with the agent definition for with_agent mode, writes with_agent/without_agent mode dirs and per-mode summary aggregates, and stamps `target` into summary.json; artifacts.ts generalized BenchmarkRunInput.configuration to any A/B mode name so benchmark.json emits with_agent/without_agent configs that aggregate_benchmark.py aggregates unchanged; new case file evals/cases/security-auditor.json (first agent target); validation test checks target values; 4 target-resolution unit tests plus an agent benchmark.json test added; SPEC.md documents the target field, mode dirs, and CLI flags; smoke-verified with a dummy executor plus aggregate_benchmark.py and generate_review.py --static consuming the with_agent/without_agent grading.json and timing.json directly.
  - Fase 5: verification (typecheck, lint, test, evals --dry-run) plus smoke test of `generate_review.py --static` and `aggregate_benchmark.py` over an existing iteration workspace (offline, no executor spend). Done 2026-09-23: verification accumulated across Fases 1-4 and re-confirmed at merge time - typecheck clean, ESLint clean on all changed files, 54/54 tests pass; dry-run validates all case files (skill and agent targets); offline dummy-executor runs produced grading.json, timing.json, benchmark.json, history.json consumed cleanly by both aggregate_benchmark.py (run_summary plus delta) and generate_review.py --static (48KB review.html). Roadmap complete; shipped via PR #45 (merge commit f8c2ab6).
- Collection audit fixes (P0-P2 from the verified agents/skills audit report). Done 2026-09-23, shipped via PR #46 (merge commit eddd05d): P0-1 decomposeTask dependency bug fixed (dependencies now derive from the same index as step ids, plus alignment unit tests incl. empty-line skipping); P0-2 byte-level scan and repair of 18 markdown files (BOM stripped, double-encoded arrows/multiplication/middle-dot/box-drawing/em-dash re-encoded to ASCII, rescan clean); P1 split-truth consolidation (ADR: documentation/references/adr.md now points to architecture-decision skill, skeleton removed from templates.md; PRD: sdlc-documentation/references/prd.md is the single template, PRD_TEMPLATE.md is an alias pointer, requirements-spec.md repointed; git: conventional-branch.md merged into branching.md and conventional-commit.md merged into commits.md, both duplicates deleted, SKILL.md references updated, no broken references); P2-1 git-workflow trigger description narrowed (generic git command keywords removed); P2-2 OpenAPI cross-reference added to api-conventions/SKILL.md. Deferred pending user decision: P2-3 (new config-management skill) and P2-4 (explore/scout/general definitions). P2-4 resolved 2026-09-23 (direct to main): explore/scout/general documented as built-in OpenCode platform subagents in the orchestrator.md delegation list; no local agent files created to avoid overriding platform defaults and trigger collisions. P2-3 remains open in backlog.
- Eval iteration-2 with fixed harness: re-run git-workflow, data-analysis, documentation, code-simplifier, design-md, project-lifecycle (`--iteration 2`); success criteria: git-workflow rises from 0/7 and clarify-pattern absent from outputs; consider DeepEval LLM-judge for wording-vs-quality failure separation

---

## Backlog

Catatan personal yang belum dijadwalkan (bukan bagian dari roadmap):

- [ ] Harden assertion grading (found in the iteration-2 review): `gradeOutput` compares with `toLowerCase()`, so the case-3 assertion `BREAKING CHANGE` passes for output that says `Breaking change:` even though Conventional Commits tokens are case-sensitive and the `!` marker was missing; add a case-sensitive option or `/regex/flags` support per assertion. Keyword assertions also pass outputs that only ask for missing input (`documentation-1` with_skill scored 2/3 on a pure clarifying question because the sentence contained "install" and "quickstart"), so add negative or anti-deferral assertions to cases whose deliverable must contain real content. Finally, the without_skill prompt is bare but the executor cwd is `.../<skill>/iteration-2/<skill>-N/without_skill`, so candidates mention a skill they never loaded; consider neutral case directory names.
- [ ] Multi-runtime plugin manifest (.claude-plugin) for cross-harness distribution (AUDIT.md F5); superseded in scope by the agent-agnostic layering decision (see DECISIONS.md): future harnesses get an integration-layer adapter, not a fork of the catalog
- [ ] Integration-layer adapters for other agent runtimes (Claude Code, Codex CLI): agent format converter, plugin equivalent, installer target; catalog and eval tooling reused untouched
- [ ] Implement DeepEval as the LLM-judge for catalog evals (chosen direction 2026-09-15, previously deferred 2026-09-08): new `evals/judge/` Python module (uv project, deps = deepeval) that reads `evals/workspace/<skill>/iteration-N/...` outputs and grades them with G-Eval/metrics; integrate the reserved `--judge` flag in `scripts/evals/run-evals.ts` to run prompts then spawn the judge, merging scores into `summary.json`. DECISIONS.md eval tooling entry updated to match: assertion-grading runner parked baseline-only, DeepEval is the next eval iteration. Prereq (sentralisasi eval cases) already done in PR #35.

---

## Change History

| Date | Change |
|---|---|
| 2026-09-19 | Updated root docs (AGENTS, ARCHITECTURE, DECISIONS, PRD, SPEC, TASKS) for vendored skill-creator and plugin-dev under .agents/ and the agent-agnostic layering model: three layers (harness-neutral catalog, OpenCode integration, harness-neutral dev tooling), FR-8 eval tooling requirements, SPEC vendored-tooling and artifact-layout sections, TASKS Fase 1-5 plan, backlog item for future harness adapters |
| 2026-09-17 | Eval iteration-1 baseline completed (33 skills, 79 cases, 158 runs): with_skill 49/79 vs without_skill 53/79; output diagnosis identified plan-mode candidate behavior, grading-key contamination (expected_output.txt in executor cwd), and clarify-deferral pattern (git-workflow 0/7); runner fixed (graded/ isolation, build agent default executor) and git-workflow revised to apply defaults instead of pausing with clarifying questions |
| 2026-09-17 | Eval prompt wrapper fixed: skill instructions were injected before the task, causing small models to summarize the skill instead of doing the task (persisted even with build agent and revised git-workflow); wrapper now puts the task first with the skill as loaded context, verified by iteration-2 smoke test (git-workflow case 1: 0/2 to 2/2 with skill) |
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
