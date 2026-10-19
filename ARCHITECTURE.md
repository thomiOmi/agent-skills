# Architecture

System architecture for the agent-skills Agent Orchestra.

---

## Overview

Agent Orchestra turns OpenCode into a multi-role development team. The primary `plan` agent interacts with the user for planning, while the `orchestrator` subagent coordinates work across specialized subagents using a verification loop, mimicking real-world engineering orgs.

**Key principles:**

- **Primary plan agent for user interaction** - default primary agent is `plan`
- **Orchestrator as coordinator** - delegates, does not do domain work directly
- **Subagents are focused** - each owns a domain (coding, product, data, QA, security, design, etc.)
- **Verification before delivery** - every result is verified before returning to the user
- **Progressive disclosure** - skills are loaded on-demand, not all at once
- **Agent-agnostic by layering** - the catalog is harness-neutral; only the integration layer assumes OpenCode (see Layering below)

---

## System Diagram

```mermaid
flowchart TD
    User["User Input / Discussion"] --> Plan["plan agent (built-in primary)"]
    Plan --> Orchestrator["orchestrator subagent<br/>task decomposition"]

    Orchestrator --> Eng["Engineering group<br/>frontend-developer, backend-developer,<br/>database-engineer, software-architect,<br/>ai-engineer, senior-developer"]
    Orchestrator --> Prod["Product and Planning group<br/>product-manager, project-manager, data-analyst"]
    Orchestrator --> QAG["Quality and Security group<br/>qa-engineer, security-auditor"]
    Orchestrator --> Ops["Delivery group<br/>devops, docs-writer"]
    Orchestrator --> Think["Reasoning and Content group<br/>brainstormer, deep-thinker, researcher,<br/>refactor-planner, marketing, ui-ux"]

    Eng --> SkillCheck{"Skill-level<br/>verification"}
    Prod --> SkillCheck
    QAG --> SkillCheck
    Ops --> SkillCheck
    Think --> SkillCheck

    SkillCheck -- PASS --> CentralCheck{"Project quality gate<br/>own lint / typecheck / tests"}
    SkillCheck -- FAIL --> Eng

    CentralCheck -- PASS --> Remember["TASKS.md & Context<br/>persistence"]
    CentralCheck -- "FAIL &lt; 3 retries" --> Eng
    CentralCheck -- FAIL exhausted --> Escalate["Escalate to user"]

    Remember --> Return["Return to user"]
```

> Full detail for all 20 agents lives in the Agent Roster table below. The
> diagram is deliberately grouped by domain so it does not need updating
> every time the agent roster grows or shrinks.

---

## Agent Roster

> Canonical source: this table must list the same agents as the Agent Orchestra
> table in `AGENTS.md`. If they diverge, `AGENTS.md` wins - see the
> documentation-audit entry in DECISIONS.md.
>
> Key Skills per agent live in `AGENTS.md` only. This table does not repeat
> them, because a second copy can silently go stale.

| Agent | Mode | Role | Delegates To |
|---|---|---|---|
| **orchestrator** | subagent | Task decomposition, delegation, verification | All subagents via `task` tool |
| **frontend-developer** | subagent | UI implementation, components, client state, styling | - |
| **backend-developer** | subagent | API endpoints, business logic, auth, server-side integration | - |
| **software-architect** | subagent | System design, ADRs, trade-off analysis, architecture review | - |
| **database-engineer** | subagent | Schema design, migrations, indexing, query performance | - |
| **ai-engineer** | subagent | Prompt engineering, AI integration, RAG, structured output | - |
| **senior-developer** | subagent | Tech lead: cross-domain review, standards, glue work, hard debugging | - |
| **product-manager** | subagent | PRDs, feature specs, user stories, roadmap | - |
| **project-manager** | subagent | Project planning, milestone tracking, risk, status reports | - |
| **data-analyst** | subagent | SQL analysis, reporting, data profiling | - |
| **ui-ux** | subagent | Design system, frontend, accessibility | - |
| **marketing** | subagent | Content, SEO, copy, strategy | - |
| **qa-engineer** | subagent | Test strategy, coverage, quality gates | - |
| **devops** | subagent | CI/CD, deployment, infrastructure | - |
| **security-auditor** | subagent | Security review, auth, vulnerability assessment | - |
| **brainstormer** | subagent | Creative ideation, solution exploration | - |
| **deep-thinker** | subagent | Complex reasoning, root cause analysis | - |
| **researcher** | subagent | Technical research, comparisons, evidence-based recommendations | - |
| **docs-writer** | subagent | Technical writing, documentation | - |
| **refactor-planner** | subagent | Safe refactoring, legacy code migration | - |

---

## Layering (Agent Agnostic)

The project is structured in three layers so future harnesses other than OpenCode can be supported without forking the catalog:

| Layer | Contents | Coupling |
|---|---|---|
| Catalog (harness-neutral) | `skills/*/SKILL.md` (open Agent Skills format per agentskills.io), skill scripts/references/assets | No harness assumptions; portable to any agent runtime that reads SKILL.md |
| Integration (OpenCode-specific) | `agents/*.md` (OpenCode agent format with XML markup), `tools/*.ts`, `plugin/` hooks, `config/*.jsonc`, `commands/`, installer (`src/`) | Assumes OpenCode v2 conventions; swappable per harness |

Adding support for a future harness (for example Claude Code, Codex CLI) means writing a new integration layer (agent format converter, plugin equivalent, installer target) while reusing the catalog untouched.

---

## Verification Loop

Workflow: `discussion to plan to orchestrator to test to implement to review to verify to remember to improve`

1. **Discussion** - user and agent clarify goals and requirements
2. **Plan** - built-in primary `plan` agent analyzes the request and creates a plan
3. **Decompose** - `orchestrator` subagent breaks down tasks into `TASKS.md`
4. **Delegate** - subtasks dispatched to specialized subagents via `task` tool
5. **Verify** - dual-layer quality gates (skill-level + centralized quality verifier)
6. **Remember** - progress and decisions persisted to `TASKS.md`
7. **Return** - verified results delivered to user

---

## Skills to Agent Mapping

| Skill | Used By | Purpose |
|---|---|---|
| task-decomposition | orchestrator | Breaking down complex tasks and TASKS.md tracking |
| code-style | senior-developer | Code quality conventions |
| testing | senior-developer, qa-engineer | Test writing conventions |
| debugging | senior-developer, qa-engineer | Bug diagnosis workflow |
| api-conventions | senior-developer | API design consistency |
| database | senior-developer, data-analyst | Schema, queries, optimization |
| data-analysis | data-analyst | SQL queries, data modeling, dataset analysis |
| research-methodology | researcher | Technical research, comparisons, evidence-based recommendations |
| git-workflow | senior-developer | Git conventions, branch naming, Conventional Commits |
| ai-integration | senior-developer | LLM/API integration |
| ui-design | ui-ux | Design system, frontend, accessibility |
| content-strategy | marketing | Content, SEO, copy, strategy |
| no-ai-slop | marketing, docs-writer | Removing AI slop patterns from prose while preserving voice |
| devops-deployment | devops | CI/CD, deployment, infrastructure |
| security-review | security-auditor | Security audit checklist |
| documentation | all | Writing docs |
| planning | all | System design, ERD, flows, diagrams |
| sdlc-documentation | product-manager, docs-writer | PRD, SDD, requirements, test plans |

---

## Custom Tools

The project currently ships no custom tools; the plugin registers only hooks (see Plugin Hooks below). Tool history:

### task-decomposer.ts (removed)

Deprecated and deleted after the root-docs audit: its `inferAgent()` keyword routing covered only 5 of the 20 agents, which violates the hardcoded-routing-in-the-orchestrator-prompt decision. The underlying `skills/task-decomposition/scripts/task-decomposer.ts` remains as part of the skill.

### quality-verifier.ts (removed)

Removed on 2026-10-20: its file-level checks were language-specific (debug-statement scan for `console.log`/`debugger`/`print`, JSDoc-on-exports docstring scan, package.json plus bun/npm script checks) while the agent and skill catalog is advertised as language-agnostic, so every additional language would add patterns and false-positive tuning forever; each language's own tooling already does this better (eslint no-console, ruff, clippy, golangci-lint). The centralized verification layer now means the agent runs the project's own lint, typecheck, and test commands (see PRD FR-5). The wrapper `tools/quality-verifier.ts` and `tests/quality-verifier.test.ts` were deleted with it, and the installer no longer ships a `tools/` directory.

---

## Plugin Hooks

All hooks live in `plugin/` and are registered by the harness in `plugin/agent-skills.ts`.

### compaction.ts

Injects TASKS.md project state (Continue Here section) into the compaction prompt via `experimental.session.compacting`, so task progress survives context compaction.

### secrets-scanner.ts

Blocks write/edit tool calls whose string arguments contain likely secrets (AWS, GitHub, OpenAI, Anthropic, Stripe, Google, Slack, private key blocks, hardcoded credential assignments) via `tool.execute.before`. Throws before execution; placeholder values are ignored. Escape hatch: `AGENT_SKILLS_DISABLE_SECRETS_SCANNER=1`.

### tool-guardian.ts

Blocks irreversible destructive bash commands via `tool.execute.before`: recursive force deletes targeting filesystem roots, home, or wildcards - including glob forms (`rm -rf /*`, `~/*`, `$HOME/*`, `C:\*`), quoted home vars (`"$HOME"`, `"$env:USERPROFILE"`), and traversal forms that resolve to a root (`/.`, `/..`, `/tmp/..`) - in both short flags like `-rf` and GNU long forms like `--recursive --force`; Windows-native `del` / `rmdir` with `/s` plus `/q` or `/f` against those same targets; git force push (except `--force-with-lease` and safe variants like `--force-if-includes`); mkfs/fdisk/dd to devices/format; DROP TABLE/DATABASE/SCHEMA; chmod -R 777 on / or ~. Specific-path deletes and recoverable operations are allowed. Escape hatch: `AGENT_SKILLS_DISABLE_TOOL_GUARDIAN=1`.
