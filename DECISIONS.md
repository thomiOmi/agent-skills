# DECISIONS.md

Architectural decisions, conventions, and known issues for the agent-skills project.

---

## Decisions

Key architectural decisions. Review before making changes that touch these areas.

### Orchestrator as subagent, built-in plan/build as primary

OpenCode built-in `plan` and `build` agents serve as the primary user interface. The `orchestrator` subagent handles task decomposition, delegation, and verification. Orchestrator has `task` permission (except self-delegation) to coordinate specialized subagents.

### Agent selection: hardcoded routing in orchestrator prompt

Task to agent mapping is hardcoded in the orchestrator prompt, not a custom tool. Provides full control and reliability.

### Quality verification: dual-layer (skill-level + centralized)

Verification has two layers: (1) domain-specific checklist in each SKILL.md executed by the subagent, (2) centralized quality-verifier tool executed by qa-engineer. qa-engineer has access to run tests, typecheck, lint.

### Resumable Subagent Task Recovery (`task_id`)

OpenCode surfaces failed subagent tool calls with a resumable `task_id`. If a subagent task fails or needs iteration, pass the `task_id` back to the `task` tool with additional guidance to resume the child session rather than restarting from scratch.

### Global rules format: concise + grouped by task type

`instructions/AGENTS.md` is deliberately concise (~800 tokens) with intent-based rules. Domain detail lives in SKILL.md (progressive disclosure).

### Priority Ladder

Rules have explicit priority order when they conflict: Anti-Hallucination > Security > Testing > Code Quality > Evidence & Source Citation > Self-Correction > Task Recovery > Communication > Chain of Thought > Decision-Making > Context Awareness > Final Recommendation.

### Intent-based tool references

Rules describe intent, not specific tools. "Search instead of reading files" rather than "use rg or grep". This keeps rules cross-platform and independent of environment tools.

### Task Classification

Every request is classified as Analysis, Implementation, or Both at the start. Agents apply only the relevant rule set, reducing cognitive overhead and token waste.

### Tool guard hooks: throw-to-block in `tool.execute.before`

`secrets-scanner` and `tool-guardian` are sibling modules in `plugin/` registered by the harness in `plugin/agent-skills.ts` (composed into one `tool.execute.before` hook). They block by throwing an error from the hook, the official OpenCode pattern. Scope: secrets-scanner inspects write/edit string args only; tool-guardian inspects bash commands only. Specific-path deletes (`rm -rf node_modules`), `git reset --hard`, and `--force-with-lease` are deliberately allowed; guards are a safety net, not a permission system. Escape hatch env vars: `AGENT_SKILLS_DISABLE_SECRETS_SCANNER=1`, `AGENT_SKILLS_DISABLE_TOOL_GUARDIAN=1`.

### Conventional git skills as references under git-workflow

Initially shipped as standalone skills (`conventional-branch`, `conventional-commit`) positioned as deep-dives under the `git-workflow` umbrella. Later merged into git-workflow as `references/conventional-branch.md` and `references/conventional-commit.md` after a collision audit showed a single git action lit up three skills at once. The merge rule applied across the catalog: one skill per agent moment, thin overlapping skills become references of the parent that owns the trigger surface.

### Eval tooling: assertion grading parked, DeepEval chosen for LLM-judge

Evaluated external eval libraries (Vercel evalite-style runners, DeepEval, Harbor, G-Eval implementations) and decided none is needed: `scripts/evals/run-evals.ts` grades with assertion matching, which is deterministic and free. LLM-judge grading (via `opencode run` in G-Eval style) is recognized as the future pattern but is deferred until skill development stabilizes.

Update 2026-09-15: the assertion-grading runner is parked as baseline-only. It stays tracked in git together with `evals/cases/` as reference material for the next iteration, and its final baseline batch (one sequential run over the remaining 31 skills after the free-tier quota resets) is still executed to identify weak skills for free. DeepEval is chosen as the direction for the next eval iteration (LLM-judge, G-Eval style, reading `evals/workspace/` outputs, wired through the reserved `--judge` flag). The current runner is no longer the target architecture for grading quality; new eval capabilities should not be built on it.

Update 2026-09-19: Fase 0 hardening landed in the parked runner before the DeepEval pilot, because iteration-2 grading review found two honesty gaps the plain substring form cannot express. `gradeOutput` now accepts versioned assertion objects (`{text, regex?, caseSensitive?, negate?}`) next to legacy strings (legacy behaviour unchanged, so recorded baselines stay valid); `GRADING_VERSION = 2` is stamped into `summary.json` so results graded under different semantics are never compared; case files are validated (regex compiles, text non-empty) before any executor spend. Two known grading failure modes this fixes: case-sensitive convention tokens such as `BREAKING CHANGE` used to pass on `Breaking change:`, and a candidate that only asks for the missing input could earn partial credit for doing no work (anti-deferral now expressible via `negate`). Separately, the default executor pins the model explicitly (`opencode run --model opencode/mimo-v2.5-free ...`) because auto-selection caused quota failures that could not be rerouted - nobody could tell which model a failing lane had used, and `small_model` in the global config pointed at the wrong model. Zen free-tier access from external scripts is impossible by policy (direct `chat/completions` returns `FreeTierError: free tier can only be used from within OpenCode`); the judge must therefore run through `opencode run` (or the SDK, which spawns a real opencode server - verified working, blocked only by quota at probe time), not raw HTTP against the Zen endpoint.

Update 2026-09-19: the DeepEval direction is superseded by the vendored skill-creator harness (see the vendor decision in this file). The grader subagent of skill-creator (LLM-judge with evidence per expectation) runs through the same `opencode run` path, which satisfies the original G-Eval style intent; benchmark aggregation and the static review viewer come from the vendored scripts instead of DeepEval metrics. DeepEval remains a possible future addition but is no longer the chosen next step; the Fase 1-5 plan in TASKS.md is the active eval direction.

### Eval cases centralized under evals/cases/ (divergence from agentskills.io)

Eval case definitions live in `evals/cases/<skill>.json` (one file per skill) instead of inside each skill directory (`skills/<name>/evals/evals.json`). This deliberately diverges from the agentskills.io per-skill eval convention: eval cases are maintainer tooling, and the old layout shipped them to every user via the installer (deploy/sync/symlink copy `skills/` recursively without filtering). Centralizing keeps `skills/` distribution-clean, gives a single root for eval infrastructure (cases + workspace + judge), and preserves per-skill diffs via filename granularity. Fixture files for a case live under `evals/cases/<skill>.files/`.

### Eval harness validity: grading key isolated, build agent for execution

Iteration-1 baseline (33 skills, 79 cases) surfaced two validity problems in the harness, diagnosed from raw `output.txt` reads. First, `expected_output.txt` was scaffolded into the case directory that also served as the executor cwd, so candidates could read the grading key (confirmed in design-md output: "Based on the skill and expected output"). Second, the default executor (`opencode run`) resolves the global `default_agent: "plan"` from the deployed config, so candidates answered as a read-only planning assistant instead of doing the task; git-workflow, data-analysis, and code-simplifier outputs explicitly reply in meta/plan voice. Fixes in `scripts/evals/run-evals.ts`: expected_output.txt moved to `graded/expected_output.txt` (outside the executor cwd), and the default executor is now `opencode run --agent build --auto` (primary build agent, auto-approved permissions). Iteration-1 numbers remain directionally useful for A/B deltas but their absolute pass rates are contaminated; iteration-2 runs use the fixed harness.

### Vendor skill-creator under .agents/skills/ (executor shim, grading logic untouched)

The anthropics skill-creator plugin (Python eval harness: `run_eval.py`, `run_loop.py`, `aggregate_benchmark.py`, `generate_report.py`, `eval-viewer/generate_review.py`, grader/comparator/analyzer subagents, `references/schemas.md`) is vendored at `.agents/skills/skill-creator/` as development-only tooling, forked from anthropics/claude-plugins-official `plugins/skill-creator`. Location rationale: dot-prefixed `.agents/` is excluded from npm publish (`files` in package.json lists only `agents, skills, tools, plugin, bin, src, AGENTS.md`), from tsc (`include` does not cover it), and from ESLint scans, while the `.agents/` convention is an increasingly common home for non-distributed agent assets. The runner TS (`evals/src/run-evals.ts` after the scripts/evals refactor) remains the executor and cases bridge; vendored Python scripts are not replaced by TS reimplementations. Adaptation rule: `claude -p` invocations are mapped to `opencode run --model <pinned> --agent build --auto` via a shim or minimal flag patch; grading logic, benchmark aggregation, and the review viewer are used as-is. Eval cases remain centralized in `evals/cases/<skill>.json` (per the earlier divergence decision); a bridge converts them to skill-creator's per-skill `evals.json` format, mapping `assertions` to `expectations`. Syncing a new upstream version requires re-applying the shim and recording the upstream commit hash in `.agents/README.md`.

### plugin-dev vendored as read-only authoring reference, not ported

anthropics/claude-code `plugins/plugin-dev` (7 authoring skills, 3 agents, 1 command) is vendored at `.agents/plugins/plugin-dev/` in its original Claude Code format. It serves as reference material for plugin, agent, and command authoring best practices (progressive disclosure, strong triggers, security-first hooks). It is deliberately not ported to OpenCode format and not installed by the CLI: its guidance is consulted during authoring, while this repo's own conventions (agentskills.io SKILL.md spec, OpenCode agent format) remain the enforceable standard.

### Agent-agnostic by layering (catalog vs integration vs dev tooling)

The catalog (skills in open Agent Skills format, eval cases) carries no harness assumptions; the integration layer (agents/*.md markup, plugin hooks, tools, config, installer) is OpenCode-specific and swappable; dev tooling (eval runner, vendored skill-creator) is harness-neutral with selectable executor and judge. Future support for other agent runtimes (Claude Code, Codex CLI, etc.) is an integration-layer adapter only, catalog and eval tooling are reused untouched. Consequence for authoring: new skills must not assume OpenCode-specific behavior in SKILL.md bodies; harness-specific instructions belong in the integration layer (agent files, plugin).

### Release notes: changelogen emoji headings kept, bodies applied via notes-file



changelogen emits emoji section headings such as (🚀 Enhancements, 🩹 Fixes, 💅 Refactors, 📖 Documentation, 🏡 Chore) into CHANGELOG.md and release output. They are kept as-is - the changelog is already the documented exception to the no-emoji rule, so v0.3.0 and v0.4.0 lacking emoji headings was not a regression to fix. Separately, GitHub Release bodies created with inline shell interpolation (`bun -e`, PowerShell strings) were silently truncated at the first `#` character, cutting off the first emoji heading. Practice: extract the version section from CHANGELOG.md into a temporary file and apply it with `gh release create/edit --notes-file <file>`, then verify the body via `gh release view --json body` before moving on.

### Agent file markup: XML tags retained (evaluated against modern conventions)

Evaluated converting the 20 `agents/*.md` bodies from XML tags (`<role>`, `<skills_to_load>`, `<constraints>`, `<workflow>`, `<output_format>`) to markdown headings after observing that community agent files (Claude Code agent collections, official OpenCode docs examples) use `#`/`##` headings. Primary sources checked: the agentskills.io specification states the body has "no format restrictions" and its no-XML rules apply to frontmatter name and description fields, not the body; Anthropic prompting best practices still list "Structure prompts with XML tags" as an active general principle for current Claude models; community guides for writing subagent prompts actively recommend XML blocks such as `<constraints>` and `<output_format>`; OpenCode agent docs prescribe no body format at all. Decision: keep XML tags. Rationale: agent files are system prompts rather than documents, and XML structuring is an officially recommended prompting technique; the three-way sync invariant (skills_to_load against AGENTS.md Key Skills against the orchestrator delegation list) and the one-grep audit depend on consistent markup; 18 of 20 agents shipped with this format since the initial commit. A conversion would also contradict skills/prompt-design/SKILL.md, which explicitly teaches XML tags as a technique. If revisited, protect the 4 output templates containing `##` headings (brainstormer, deep-thinker, project-manager, researcher) before any mechanical conversion.

### Documentation audit: PRD/ARCHITECTURE agent-roster drift resolved; task-decomposer.ts deprecated

A documentation audit found `PRD.md` FR-2 listing only 13 of the 20 agents actually defined in `AGENTS.md`/`agents/`, the `ARCHITECTURE.md` System Diagram showing only 10 of 20 agents as individual nodes, and the `ARCHITECTURE.md` Agent Roster table listing only 15 of 20. All three are fixed: PRD.md FR-2 now lists all 20 agents and defers to `AGENTS.md` (Agent Orchestra section) as the canonical roster source; the System Diagram is regrouped by domain (Engineering, Product and Planning, Quality and Security, Delivery, Reasoning and Content) instead of one node per agent, so it does not need updating every time the roster changes; the ARCHITECTURE.md roster table now lists all 20 agents.

The same audit re-confirmed the earlier "Agent selection: hardcoded routing in orchestrator prompt" decision above, and found `tools/task-decomposer.ts` violates it: the tool wraps `skills/task-decomposition/scripts/task-decomposer.ts`, whose `inferAgent()` performs keyword-based agent routing covering only 5 of the 20 current agents (qa-engineer, devops, marketing, ui-ux, security-auditor, with senior-developer as fallback) - any database, backend, AI-integration, or architecture task would be misrouted to senior-developer if the tool were ever invoked instead of the prompt-based routing. Status: **deprecated** (tool marked deprecated in PRD.md FR-4 and Scope). Follow-up code pass (kept separate because it touches `tools/` and `plugin/`): delete `tools/task-decomposer.ts` and its `"task-decomposer"` registration in `plugin/agent-skills.ts`'s tool map. The skill script `skills/task-decomposition/scripts/task-decomposer.ts` and its tests are NOT deprecated - `decomposeTask`/`inferAgent` remain a legitimate part of the task-decomposition skill.

Separately flagged in the same audit, tracked for a future code-only pass (not resolved here because they touch `skills/` and `plugin/`):

- `skills/testing/scripts/quality-verifier.ts` - every check branch (`checkLint`, `checkTypecheck`, `checkTests`, `checkNoDebug`, `checkDocstrings`) unconditionally returns `passed: true` with a hint message and never runs a command (no exec/spawn/child_process anywhere in the file). The orchestrator's QA gate (FR-5, dual-layer verification) is currently a no-op.
- `plugin/tool-guardian.ts` - `isRecursiveForceDelete()`'s flag regexes (`/(^|\s)-\w*[rR]/` and `/(^|\s)-\w*f/`) only match single-dash short flags; the long-form alternates match `-recurse`/`-force` (single dash, PowerShell style) but not GNU double-dash `--recursive`/`--force`, so `rm --recursive --force /` is not blocked. Verified live via `findDangerousCommand()`. The equivalent long-form check is already correct in `isForcePush()` in the same file, and `tests/plugin-guards.test.ts` has no long-form GNU rm cases to catch this.


---

## Conventions

### Agent Permission Convention
- Every agent must have explicit `read: allow`
- `edit: deny` and `bash: deny` as safe defaults for read-only agents
- Only agents that need to run tests get `bash: allow` without restriction
- Content and planning agents (docs, product, marketing, data, design, devops) get `bash: ask` - usable with user confirmation, never silent
- orchestrator and senior-developer - full bash access
