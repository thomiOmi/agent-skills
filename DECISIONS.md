# DECISIONS.md

Architectural decisions, conventions, and known issues for the agent-skills project.

---

## Decisions

Key architectural decisions. Review before making changes that touch these areas.

### Orchestrator as subagent, built-in plan/build as primary

OpenCode built-in `plan` and `build` agents serve as the primary user interface. The `orchestrator` subagent handles task decomposition, delegation, and verification. Orchestrator has `task` permission (except self-delegation) to coordinate specialized subagents.

### Agent selection: hardcoded routing in orchestrator prompt

Task to agent mapping is hardcoded in the orchestrator prompt, not a custom tool. Provides full control and reliability.

### Quality verification: dual-layer (skill-level + project quality gate)

Verification has two layers: (1) domain-specific checklist in each SKILL.md executed by the subagent, (2) a project quality gate where the agent runs the project's own lint, typecheck, and test commands. qa-engineer has access to run tests, typecheck, lint.

### quality-verifier removed: language-specific checks do not belong in the catalog

The custom quality-verifier tool (tools/ wrapper, skills/testing/scripts/quality-verifier.ts implementation, and its tests) was removed on 2026-10-20. Its file-level checks only understood one language family - console.log/debugger/print for debug statements, JSDoc comments on exports for docstrings, package.json plus bun/npm for script checks - while the agent and skill catalog is advertised as language-agnostic, so every additional language would mean new patterns and false-positive tuning forever; each language's own tooling already does this better (eslint no-console, ruff, clippy, golangci-lint). The centralized verification layer now delegates to the project's own quality commands in whatever language the project uses; the orchestration flow (skill checklist first, then project commands, retry via task_id) is unchanged. The installer no longer ships a tools/ directory; existing installs can delete the stale ~/.config/opencode/tools/quality-verifier.ts on next setup. Follows the same removal pattern as task-decomposer. Source: development-tools audit 2026-10-20.

### Resumable Subagent Task Recovery (`task_id`)

OpenCode surfaces failed subagent tool calls with a resumable `task_id`. If a subagent task fails or needs iteration, pass the `task_id` back to the `task` tool with additional guidance to resume the child session rather than restarting from scratch.

### Global rules format: concise + grouped by task type

`instructions/AGENTS.md` is deliberately concise (~800 tokens) with intent-based rules. Domain detail lives in SKILL.md (progressive disclosure).

`instructions/OPENCODE.md` documents OpenCode built-in tools and model-execution guidelines. It is NOT auto-loaded by the installer (PR #52: "stop loading OPENCODE.md automatically"); `config/opencode.jsonc` loads only `AGENTS.md`. Consult `OPENCODE.md` on demand as a reference when working with OpenCode built-in tools.

### Priority Ladder

Rules have explicit priority order when they conflict: Anti-Hallucination > Security > Testing > Code Quality > Evidence & Source Citation > Self-Correction > Task Recovery > Communication > Chain of Thought > Decision-Making > Context Awareness > Final Recommendation.

### Intent-based tool references

Rules describe intent, not specific tools. "Search instead of reading files" rather than "use rg or grep". This keeps rules cross-platform and independent of environment tools.

### Task Classification

Every request is classified as Analysis, Implementation, or Both at the start. Agents apply only the relevant rule set, reducing cognitive overhead and token waste.

### Tool guard hooks: throw-to-block in `tool.execute.before`

`secrets-scanner` and `tool-guardian` are sibling modules in `plugin/` registered by the harness in `plugin/agent-skills.ts` (composed into one `tool.execute.before` hook). They block by throwing an error from the hook, the official OpenCode pattern. Scope: secrets-scanner inspects write/edit string args only; tool-guardian inspects bash commands only. Specific-path deletes (`rm -rf node_modules`), `git reset --hard`, and `--force-with-lease` are deliberately allowed; guards are a safety net, not a permission system. Escape hatch env vars: `AGENT_SKILLS_DISABLE_SECRETS_SCANNER=1`, `AGENT_SKILLS_DISABLE_TOOL_GUARDIAN=1`.

A 2026-10-20 development-tools audit closed token-level gaps in the delete guard: the old single `DELETE_TARGET` regex missed glob targets (`rm -rf /*`, `~/*`, `$HOME/*`, `C:\*`), quoted home vars (`"$HOME"`, `"$env:USERPROFILE"`), traversal forms that resolve to a root (`/.`, `/..`, `/tmp/..`), and Windows-native `del` / `rmdir` with `/s` plus `/q` or `/f`. Detection is now token-based: each operand is quote-stripped and slash-normalized, then checked against root, home, and drive-root predicates with lexical resolution, so `rm -rf /*` is blocked while `rm -rf ./build/*` stays allowed. `git push --force-if-includes` is no longer blocked as a force-push false positive. Regression cases live in `tests/plugin-guards.test.ts`.

### Agent frontmatter still uses the V1 permission map (known gap)

The OpenCode v2 docs (https://opencode.ai/v2/docs/agents and /v2/docs/migrate-v1) mark `permission`, `bash`, `task`, `tools`, and top-level `temperature` as legacy V1 fields; V2 expects an ordered `permissions` array of `{action, resource, effect}` (with `shell` and `subagent` replacing `bash` and `task`) plus provider options under `request.body`. All 20 agent files in this repository still use the V1 shape, so the catalog targets OpenCode conventions rather than native V2 fields. The mismatch is deliberate for now: the repository pins `@opencode-ai/plugin` 1.x, and the migration touches 20 agent files at once. INSTALL.md documents the V2 shapes so contributors can adopt them when overriding models or permissions. Migrating the agent files is a separate, explicitly approved step.

Initially shipped as standalone skills (`conventional-branch`, `conventional-commit`) positioned as deep-dives under the `git-workflow` umbrella. Later merged into git-workflow as `references/conventional-branch.md` and `references/conventional-commit.md` after a collision audit showed a single git action lit up three skills at once. The merge rule applied across the catalog: one skill per agent moment, thin overlapping skills become references of the parent that owns the trigger surface.

### Eval tooling (removed)

Eval support was removed from this project: the assertion-grading runner
(`evals/`), the vendored skill-creator harness under `.agents/`, and the
related eval unit tests were deleted. The entries below are historical
record only - they describe tooling that no longer exists.

Historical evaluation: external eval libraries (Vercel evalite-style runners, DeepEval, Harbor, and G-Eval implementations) were evaluated while the assertion-grading runner existed. No replacement was adopted before the eval tooling was removed.

Update 2026-09-15: before the eval tooling was removed, the assertion-grading runner was parked as baseline-only. The archived decision was to retain its case and workspace data as reference material and consider DeepEval for a future LLM-judge iteration. This historical direction no longer describes an active repository capability.

Update 2026-09-19: before the eval tooling was removed, Fase 0 hardening addressed grading semantics and executor reproducibility. The implementation details below are retained as historical context only; no current scripts or tests in this repository depend on them.

Update 2026-09-19: the DeepEval direction was later superseded by the vendored skill-creator harness, and that vendored tooling was subsequently removed as well. These decisions are historical and must not be read as a current eval plan. Current roadmap items are tracked in `TASKS.md`.

### Eval cases centralized under evals/cases/ (historical; tooling removed)

Before the eval tooling was removed, case definitions lived in `evals/cases/<skill>.json` (one file per skill) instead of inside each skill directory. This deliberately diverged from the agentskills.io per-skill eval convention because eval cases were maintainer tooling and the old layout shipped them to every user via the installer. The historical rationale is retained for decision traceability; it does not describe files currently shipped by this repository.

### Eval harness validity (historical; tooling removed)

Iteration-1 baseline (33 skills, 79 cases) surfaced two validity problems in the harness, diagnosed from raw `output.txt` reads. First, `expected_output.txt` was scaffolded into the case directory that also served as the executor cwd, so candidates could read the grading key (confirmed in design-md output: "Based on the skill and expected output"). Second, the default executor (`opencode run`) resolves the global `default_agent: "plan"` from the deployed config, so candidates answered as a read-only planning assistant instead of doing the task; git-workflow, data-analysis, and code-simplifier outputs explicitly reply in meta/plan voice. The historical fixes moved `expected_output.txt` to `graded/expected_output.txt` outside the executor cwd and used `opencode run --agent build --auto` for execution. Iteration-1 numbers remain directionally useful for A/B deltas but their absolute pass rates were contaminated; no current iteration uses this harness.

### Vendor skill-creator under .agents/skills/ (historical; tooling removed)

The anthropics skill-creator plugin was previously vendored as development-only tooling and adapted to OpenCode with an executor shim. Its location, packaging, and bridge decisions are retained here for historical traceability. The source was later removed, so this section does not describe an installable or active component.

### plugin-dev vendored as read-only authoring reference (historical; tooling removed)

The anthropic plugin-dev reference was previously vendored in its original Claude Code format. It was not ported to OpenCode or installed by the CLI, and the source was later removed. This repository's own conventions (agentskills.io SKILL.md spec and OpenCode agent format) remain the enforceable standard.

### Agent-agnostic by layering (catalog vs integration vs dev tooling)

The catalog (skills in open Agent Skills format) carries no harness assumptions; the integration layer (agents/*.md markup, plugin hooks, tools, config, installer) is OpenCode-specific and swappable. Future support for other agent runtimes (Claude Code, Codex CLI, etc.) is an integration-layer adapter only. Consequence for authoring: new skills must not assume OpenCode-specific behavior in SKILL.md bodies; harness-specific instructions belong in the integration layer (agent files, plugin).

### Release notes: changelogen emoji headings kept, bodies applied via notes-file



changelogen emits named section headings such as Enhancements, Fixes, Refactors, Documentation, and Chore into CHANGELOG.md and release output. CHANGELOG.md is the documented exception to the no-emoji rule. GitHub Release bodies created with inline shell interpolation (`bun -e`, PowerShell strings) were silently truncated at the first `#` character. Practice: extract the version section from CHANGELOG.md into a temporary file and apply it with `gh release create/edit --notes-file <file>`, then verify the body via `gh release view --json body` before moving on.

### Agent file markup: XML tags retained (evaluated against modern conventions)

Evaluated converting the 20 `agents/*.md` bodies from XML tags (`<role>`, `<skills_to_load>`, `<constraints>`, `<workflow>`, `<output_format>`) to markdown headings after observing that community agent files (Claude Code agent collections, official OpenCode docs examples) use `#`/`##` headings. Primary sources checked: the agentskills.io specification states the body has "no format restrictions" and its no-XML rules apply to frontmatter name and description fields, not the body; Anthropic prompting best practices still list "Structure prompts with XML tags" as an active general principle for current Claude models; community guides for writing subagent prompts actively recommend XML blocks such as `<constraints>` and `<output_format>`; OpenCode agent docs prescribe no body format at all. Decision: keep XML tags. Rationale: agent files are system prompts rather than documents, and XML structuring is an officially recommended prompting technique; the three-way sync invariant (skills_to_load against AGENTS.md Key Skills against the orchestrator delegation list) and the one-grep audit depend on consistent markup; 18 of 20 agents shipped with this format since the initial commit. A conversion would also contradict skills/prompt-design/SKILL.md, which explicitly teaches XML tags as a technique. If revisited, protect the 4 output templates containing `##` headings (brainstormer, deep-thinker, project-manager, researcher) before any mechanical conversion.

### Documentation audit: PRD/ARCHITECTURE agent-roster drift resolved; task-decomposer.ts deprecated

A documentation audit found `PRD.md` FR-2 listing only 13 of the 20 agents actually defined in `AGENTS.md`/`agents/`, the `ARCHITECTURE.md` System Diagram showing only 10 of 20 agents as individual nodes, and the `ARCHITECTURE.md` Agent Roster table listing only 15 of 20. All three are fixed: PRD.md FR-2 now lists all 20 agents and defers to `AGENTS.md` (Agent Orchestra section) as the canonical roster source; the System Diagram is regrouped by domain (Engineering, Product and Planning, Quality and Security, Delivery, Reasoning and Content) instead of one node per agent, so it does not need updating every time the roster changes; the ARCHITECTURE.md roster table now lists all 20 agents.

The same audit re-confirmed the earlier "Agent selection: hardcoded routing in orchestrator prompt" decision above, and found `tools/task-decomposer.ts` violates it: the tool wraps `skills/task-decomposition/scripts/task-decomposer.ts`, whose `inferAgent()` performs keyword-based agent routing covering only 5 of the 20 current agents (qa-engineer, devops, marketing, ui-ux, security-auditor, with senior-developer as fallback) - any database, backend, AI-integration, or architecture task would be misrouted to senior-developer if the tool were ever invoked instead of the prompt-based routing. Status: **deprecated and removed**. The follow-up code pass deleted `tools/task-decomposer.ts` and its `"task-decomposer"` registration in `plugin/agent-skills.ts`'s tool map. The skill script `skills/task-decomposition/scripts/task-decomposer.ts` and its tests were NOT touched - `decomposeTask`/`inferAgent` remain a legitimate part of the task-decomposition skill.

Separately flagged in the same audit, both resolved in the follow-up code pass:

- `skills/testing/scripts/quality-verifier.ts` was a stub: every check branch (`checkLint`, `checkTypecheck`, `checkTests`, `checkNoDebug`, `checkDocstrings`) returned `passed: true` with a hint message and never ran a command, making the orchestrator's QA gate (FR-5) a no-op. Resolved by reimplementing the checks to execute: script checks spawn the matching `package.json` script via the detected package manager (bun on a bun lockfile, otherwise npm, with a shell only where Windows `.cmd` shims require it), `typecheck` falls back to the locally installed TypeScript compiler, and `checkNoDebug`/`checkDocstrings` scan the given files line by line and report file:line offenders. A check with no runnable target passes with an explicit "skipped" message, so an absent script can never masquerade as a green verification; only a check that ran and failed clears the aggregate `pass`. Covered by `tests/quality-verifier.test.ts`.
- `plugin/tool-guardian.ts` `isRecursiveForceDelete()` flag regexes only matched single-dash short flags; the long-form alternates matched `-recurse`/`-force` (single dash, PowerShell style) but not GNU double-dash `--recursive`/`--force`, so `rm --recursive --force /` was not blocked. Resolved by extending both alternates to `(--recursive|-recurse)` and `(--force|-force)`, mirroring the already-correct long-form check in `isForcePush()`. `tests/plugin-guards.test.ts` now covers GNU long-form destructive targets and long-form specific-path deletes that must stay allowed.

`tools/task-decomposer.ts` and its `"task-decomposer"` registration in `plugin/agent-skills.ts` were deleted in the same pass; PRD.md FR-4, PRD.md Scope, ARCHITECTURE.md, and INSTALL.md were updated from 2 custom tools to 1.


---

## Conventions

### Agent Permission Convention
- Every agent must have explicit `read: allow`
- `edit: deny` and `bash: deny` as safe defaults for read-only agents
- Only agents that need to run tests get `bash: allow` without restriction
- Content and planning agents (docs, product, marketing, data, design, devops) get `bash: ask` - usable with user confirmation, never silent
- orchestrator and senior-developer - full bash access
