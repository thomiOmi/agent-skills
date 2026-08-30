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

---

## Conventions

### Agent Permission Convention
- Every agent must have explicit `read: allow`
- `edit: deny` and `bash: deny` as safe defaults for read-only agents
- Only agents that need to run tests get `bash: allow` without restriction
- Content and planning agents (docs, product, marketing, data, design, devops) get `bash: ask` - usable with user confirmation, never silent
- orchestrator and senior-developer - full bash access
