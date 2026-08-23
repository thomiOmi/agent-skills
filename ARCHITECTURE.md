# Architecture

System architecture for the agent-skills Agent Orchestra.

---

## Overview

Agent Orchestra turns OpenCode into a multi-role development team. The primary `plan` agent interacts with the user for planning, while the `orchestrator` subagent coordinates work across specialized subagents using a verification loop, mimicking real-world engineering orgs.

**Key principles:**

- **Primary plan agent for user interaction** — default primary agent is `plan`
- **Orchestrator as coordinator** — delegates, does not do domain work directly
- **Subagents are focused** — each owns a domain (coding, QA, security, design, etc.)
- **Verification before delivery** — every result is verified before returning to the user
- **Progressive disclosure** — skills are loaded on-demand, not all at once

---

## System Diagram

```mermaid
flowchart TD
    User[User Input / Discussion] --> Plan[plan agent (built-in primary)]
    Plan --> Orchestrator[orchestrator subagent<br/>task decomposition]

    Orchestrator --> SD[senior-developer<br/>code-style, testing, debugging]
    Orchestrator --> UX[ui-ux<br/>ui-design]
    Orchestrator --> MKT[marketing<br/>content-strategy]
    Orchestrator --> QA[qa-engineer<br/>testing, debugging]
    Orchestrator --> DO[devops<br/>devops-deployment]
    Orchestrator --> SA[security-auditor<br/>security-review]

    SD --> SkillCheck{Skill-level<br/>verification}
    UX --> SkillCheck
    MKT --> SkillCheck
    QA --> SkillCheck
    DO --> SkillCheck
    SA --> SkillCheck

    SkillCheck -- PASS --> CentralCheck{Centralized<br/>quality-verifier}
    SkillCheck -- FAIL --> SD

    CentralCheck -- PASS --> Remember[TASKS.md & Context<br/>persistence]
    CentralCheck -- FAIL < 3 retries --> SD
    CentralCheck -- FAIL exhausted --> Escalate[Escalate to user]

    Remember --> Return[Return to user]
```

---

## Agent Roster

| Agent | Mode | Role | Delegates To | Key Skills |
|---|---|---|---|---|
| **orchestrator** | subagent | Task decomposition, delegation, verification | All subagents via `task` tool | task-decomposition, quality-verifier |
| **senior-developer** | subagent | Architecture, coding, refactoring | - | code-style, debugging, testing, api-conventions, database, git-workflow, ai-integration |
| **ui-ux** | subagent | Design system, frontend, accessibility | - | ui-design |
| **marketing** | subagent | Content, SEO, copy, strategy | - | content-strategy |
| **qa-engineer** | subagent | Test strategy, coverage, quality gates | - | testing, debugging |
| **devops** | subagent | CI/CD, deployment, infrastructure | - | devops-deployment |
| **security-auditor** | subagent | Security review, auth, vulnerability assessment | - | security-review |
| **brainstormer** | subagent | Creative ideation, solution exploration | - | (none) |
| **deep-thinker** | subagent | Complex reasoning, root cause analysis | - | (none) |
| **docs-writer** | subagent | Technical writing, documentation | - | documentation, sdlc-documentation |
| **refactor-planner** | subagent | Safe refactoring, migration planning | - | planning |

Orchestrator also delegates to OpenCode built-in subagents when the task fits better: `build` (clear implementation), `plan` (analysis only), `explore` (codebase search), `scout` (external research), `general` (generic multi-step).

---

## Verification Loop

Workflow: `discussion -> plan -> orchestrator -> test -> implement -> review -> verify -> remember -> improve`

1. **Discussion** — user and agent clarify goals and requirements
2. **Plan** — built-in primary `plan` agent analyzes the request and creates a plan
3. **Decompose** — `orchestrator` subagent breaks down tasks into `TASKS.md`
4. **Delegate** — subtasks dispatched to specialized subagents via `task` tool
5. **Verify** — dual-layer quality gates (skill-level + centralized quality verifier)
6. **Remember** — progress and decisions persisted to `TASKS.md`
7. **Return** — verified results delivered to user

---

## Custom Tools

### task-decomposer.ts

Breaks a complex task description into structured subtasks.

- **Input:** `task` (string), optional `context` (string)
- **Output:** Array of `{id, description, suggestedAgent, dependencies}`
- **Agent inference:** keyword matching on description
- **Used by:** orchestrator agent

### quality-verifier.ts

Verifies code quality against defined criteria.

- **Input:** `files` (string[]), optional boolean flags: `checkLint`, `checkTypecheck`, `checkTests`, `checkNoDebug`, `checkDocstrings`
- **Output:** `{pass: boolean, details: {criterion, passed, message}[]}`
- **Used by:** orchestrator agent (via qa-engineer subagent)
