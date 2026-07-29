# DECISIONS.md

Architectural decisions, conventions, and known issues for the agent-skills project.
Loaded automatically alongside AGENTS.md.

---

## Decisions

Key architectural decisions. Review before making changes that touch these areas.

### Primary sebagai orchestrator, not flat agents - 2026-07-25

Primary agent acts as a centralized orchestrator with verification loop. Subagents do not have `task` permission to prevent circular delegation. Verification is handled by qa-engineer + prompt instructions.

### Agent selection: hardcoded routing in primary prompt - 2026-07-25

Task to agent mapping is hardcoded in the primary prompt, not a custom tool. Provides full control and reliability. Can switch to dynamic selector if agent count exceeds 15.

### Quality verification: prompt + qa-engineer subagent - 2026-07-25

Verification loop uses the qa-engineer subagent (not a custom tool). qa-engineer has access to run tests, typecheck, lint.

### Checkpoint: MCP Memory server - 2026-07-25

Uses `@modelcontextprotocol/server-memory` as the persistence layer for task progress. Knowledge graph structure (entities + observations) fits task state well. Entity name = `checkpoint-{task_id}`, type = `checkpoint`.

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
- primary and senior-developer - full bash access

---

## Known Issues

| Issue | Location | Status |
|---|---|---|
| `quality-verifier` tool referenced but doesn't exist | agents/primary.md:37 | Fixed |