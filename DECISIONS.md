# DECISIONS.md

Architectural decisions, conventions, and known issues for the agent-skills project.

---

## Decisions

Key architectural decisions. Review before making changes that touch these areas.

### Orchestrator as subagent, built-in plan/build as primary - 2026-07-29

OpenCode built-in `plan` and `build` agents serve as the primary user interface. The `orchestrator` subagent handles task decomposition, delegation, and verification. Orchestrator has `task` permission (except self-delegation) to coordinate specialized subagents.

### Agent selection: hardcoded routing in orchestrator prompt - 2026-07-25

Task to agent mapping is hardcoded in the orchestrator prompt, not a custom tool. Provides full control and reliability. Can switch to dynamic selector if agent count exceeds 15.

### Quality verification: dual-layer (skill-level + centralized) - 2026-07-29

Verification has two layers: (1) domain-specific checklist in each SKILL.md executed by the subagent, (2) centralized quality-verifier tool executed by qa-engineer. qa-engineer has access to run tests, typecheck, lint.

### Checkpoint: MCP Memory server - 2026-07-25

Uses `@modelcontextprotocol/server-memory` as the persistence layer for task progress. Knowledge graph structure (entities + observations) fits task state well. Entity name = `checkpoint-{task_id}`, type = `checkpoint`.

### Global rules format: concise + grouped by task type - 2026-07-29

`instructions/AGENTS.md` is deliberately concise (~800 tokens) with intent-based rules, no tool-specific references. Domain detail lives in SKILL.md (progressive disclosure). Rules are grouped by task type (Universal, Analysis, Implementation, Recovery, Efficiency) so agents only apply relevant rules.

### Priority Ladder - 2026-07-29

Rules have explicit priority order when they conflict: Anti-Hallucination > Security > Testing > Code Quality > Evidence & Source Citation > Self-Correction > Task Recovery > Communication > Chain of Thought > Decision-Making > Context Awareness > Final Recommendation. This resolves conflicts like "be concise vs source citation" — source citation wins.

### Intent-based tool references - 2026-07-29

Rules describe intent, not specific tools. "Search instead of reading files" rather than "use rg or grep". This keeps rules cross-platform and independent of environment tools.

### Task Classification - 2026-07-29

Every request is classified as Analysis, Implementation, or Both at the start. Agents apply only the relevant rule set, reducing cognitive overhead and token waste from inapplicable rules.

### Agent expansion: delay until stable - 2026-07-25

Focus on stabilizing the 11 existing agents before adding new ones (researcher, project-manager, data-analyst, product-manager).

---

## Conventions

### Checkpoint Convention
- Entity name: `checkpoint-{task_id}`, entity type: `checkpoint`
- Observations per step: `"step N: <description> - done"`
- Decisions: `"decision: <what>"`
- Delete entity when task complete
- Simple tasks (< 3 steps) - no checkpoint needed

### Agent Permission Convention
- Every agent must have explicit `read: allow`
- `edit: deny` and `bash: deny` as safe defaults for read-only agents
- Only agents that need to run tests get bash access
- orchestrator and senior-developer - full bash access

