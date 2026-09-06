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

### Conventional git skills as deep-dives under git-workflow

`conventional-branch` and `conventional-commit` are standalone skills (separate descriptions so routing stays unambiguous) but positioned as deep-dives under the `git-workflow` umbrella: git-workflow keeps its references as quick-reference and points to the new skills. Both wired to senior-developer.

### Eval tooling: assertion grading, no external eval library

Evaluated external eval libraries (Vercel evalite-style runners, DeepEval, Harbor, G-Eval implementations) and decided none is needed: `scripts/evals/run-evals.ts` grades with assertion matching, which is deterministic and free. LLM-judge grading (via `opencode run` in G-Eval style) is recognized as the future pattern but is deferred until skill development stabilizes.

---

## Conventions

### Agent Permission Convention
- Every agent must have explicit `read: allow`
- `edit: deny` and `bash: deny` as safe defaults for read-only agents
- Only agents that need to run tests get `bash: allow` without restriction
- Content and planning agents (docs, product, marketing, data, design, devops) get `bash: ask` - usable with user confirmation, never silent
- orchestrator and senior-developer - full bash access
