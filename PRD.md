# PRD: agent-skills - Agent Orchestra for OpenCode

## 1. Problem Statement

The agent-skills project enables OpenCode users to work with a curated collection of specialized agents, skills, and custom tools. The current implementation uses OpenCode's built-in `plan` and `build` agents as the primary interface, with a dedicated `orchestrator` subagent that handles task decomposition, delegation, and verification.

## 2. Goals

- Use OpenCode built-in `plan` and `build` agents as the primary user interface
- Provide an `orchestrator` subagent that coordinates multi-step workflows
- Ship specialized agents for coding, testing, security, design, content, DevOps, documentation, brainstorming, planning, and refactoring
- Provide skills that support each agent role with domain-specific guidance
- Provide a custom tool for quality verification
- Follow OpenCode v2 conventions: agents as markdown, skills as SKILL.md, custom tools as TypeScript or Python
- Keep the skill catalog harness-neutral (open Agent Skills format) so future agent runtimes beyond OpenCode can adopt it via an integration-layer adapter
- Vendor anthropics skill-creator and plugin-dev as development-only tooling under `.agents/` for eval-driven skill iteration
- Enable non-developer users (vibe coders, sales, marketing, designers) to use the system effectively

## 3. Target Users

### Persona A - Developer End User

A software developer who writes code daily. Uses the agent orchestra to automate routine tasks, debug issues, and get expert-level help for specific concerns (security, testing, design).

### Persona B - Non-Developer End User

A vibe coder, sales person, marketer, or designer who uses AI agents for non-coding tasks. Describes features in plain language. Needs the orchestrator to handle decomposition and execution without managing details.

### Persona C - Tech Lead / Reviewer

A senior engineer who reviews agent output before it reaches production. Needs visibility into what each subagent did, quality verification results, and clear audit trails.

### Persona D - Contributor

A developer who wants to add new agents, skills, or tools to this repository. Needs documented conventions, consistent formats, and clear contribution guidelines.

## 4. User Stories

### Stories: Persona A - Developer End User

- As a developer, I want an orchestrator agent that decomposes complex tasks into subtasks so I don't have to manually coordinate multiple agents.
- As a developer, I want specialized agents for coding, testing, security, and design so I get expert-level help for each concern.
- As a developer, I want every result verified before delivery so I don't ship broken code.
- As a developer, I want progressive skill loading so agent response stays fast.

### Stories: Persona B - Non-Developer End User

- As a vibe coder, I want to describe features in plain language so the orchestrator handles decomposition and execution without me managing details.
- As a sales person, I want a marketing agent that drafts outreach copy so I can focus on closing deals.
- As a marketer, I want the content-strategy skill for SEO and copywriting so I can publish optimized content without hiring an agency.
- As a designer, I want the ui-ux agent to review my design system so accessibility and consistency are checked automatically.

### Stories: Persona C - Tech Lead / Reviewer

- As a tech lead, I want the orchestrator to log what each subagent did so I can review and approve the implementation without reading every file.
- As a reviewer, I want quality verification (lint, typecheck, tests) before output so I don't waste time on code that fails basic checks.
- As a tech lead, I want max retry limits on subagent iterations so the system doesn't run indefinitely on failing tasks.

### Stories: Persona D - Contributor

- As a contributor, I want SKILL.md and agent definition formats documented so I can add new skills and agents consistently.
- As a contributor, I want documented conventions (permissions, checkpoint) so my additions follow the same patterns.
- As a contributor, I want vendored skill-creator eval tooling under `.agents/` so I can iterate on skills with benchmark and human-review artifacts without reinventing the harness.

## 5. Functional Requirements

### FR-1: Workflow

The system follows this workflow for every task:

```text
discussion to plan to orchestrator to test to implement to review to verify to remember to improve
```

1. **Discussion** - user and agent interact to clarify requirements and confirm assumptions
2. **Plan** - built-in primary `plan` agent analyzes the request and creates a structured plan
3. **Orchestrator** - `orchestrator` subagent decomposes the plan into subtasks and delegates to specialized subagents
4. **Test** - tests are written first (TDD approach)
5. **Implement** - code is implemented to pass the tests
6. **Review** - implementation is reviewed against requirements
7. **Verify** - quality verification runs (lint, typecheck, tests, debug statements, docstrings)
8. **Remember** - key decisions, progress, and learnings saved to `TASKS.md` and working context for cross-session persistence
9. **Improve** - final polish and optimization after verification passes

If verification fails, the system retries from the implement step using the resumable `task_id` (max 3 retries before escalation).

### FR-2: Agent Roster

The system provides the following agents:

| Agent | Mode | Role |
|---|---|---|
| orchestrator | subagent | Task decomposition, delegation, verification, persistence |
| frontend-developer | subagent | UI implementation, components, client state, styling, accessibility |
| backend-developer | subagent | API endpoints, business logic, authentication, background jobs, server-side integration |
| software-architect | subagent | System design, ADRs, trade-off analysis, architecture review |
| database-engineer | subagent | Schema design, migrations, indexing, query performance, data integrity |
| ai-engineer | subagent | LLM prompt design, AI integration, RAG systems, structured outputs, evaluation workflows |
| senior-developer | subagent | Architecture, coding, refactoring |
| product-manager | subagent | PRDs, feature specs, user stories, roadmap planning |
| ui-ux | subagent | Design system, frontend, accessibility |
| marketing | subagent | Content, SEO, copy, strategy |
| qa-engineer | subagent | Test strategy, coverage, quality gates |
| devops | subagent | CI/CD, deployment, infrastructure |
| security-auditor | subagent | Security review, auth, vulnerability assessment |
| brainstormer | subagent | Creative ideation, solution exploration |
| deep-thinker | subagent | Complex reasoning, root cause analysis |
| researcher | subagent | Technical research, tool and library comparison, evidence-based recommendations |
| project-manager | subagent | Project planning, milestone tracking, risk management, status reporting |
| data-analyst | subagent | SQL query design, schema analysis, data modeling, reporting, query performance tuning |
| docs-writer | subagent | Technical writing, documentation |
| refactor-planner | subagent | Safe refactoring, migration planning |

The orchestrator subagent has permission to delegate to all other subagents via the `task` tool. Self-delegation is denied to prevent circular loops.

> This table must stay in sync with the Agent Orchestra table in `AGENTS.md`, which
> is the canonical source for the agent roster. If they diverge, `AGENTS.md` wins.

### FR-3: Skills

The system provides 34 skills covering code quality, testing, security, design, DevOps, AI integration, planning, documentation, and research methodology.

- Skills follow SKILL.md format with frontmatter (name, description)
- Skills load progressively: frontmatter at startup (~100 tokens), full body on activation (< 5000 tokens)
- Skills end with a domain-specific verification checklist

### FR-4: Custom Tools

| Tool | Purpose | Used By |
|---|---|---|
| quality-verifier | Verify code quality: lint, typecheck, tests, debug statements, docstrings | orchestrator (via qa-engineer) |

Tool history: `task-decomposer` was deprecated and removed (see DECISIONS.md); agent routing stays hardcoded in the orchestrator prompt.

### FR-5: Verification

Every skill includes a domain-specific verification checklist at the end of its SKILL.md. The orchestrator runs the skill-level checklist before the centralized quality-verifier tool.

Dual-layer verification:
1. **Skill-level** - domain-specific checks (e.g., security checks for auth, coverage checks for tests)
2. **Centralized** - cross-cutting checks (typecheck, lint, tests, debug statements, docstrings)

### FR-6: Persistence & Task Tracking

The system uses `TASKS.md` file-based tracking and working context documents for transparent, tool-agnostic cross-session persistence.

### FR-7: Plugin

The plugin registers agents, skills, and tools via the OpenCode plugin API.

### FR-8: Eval Tooling (Vendored skill-creator)

Skill evaluation follows the anthropics skill-creator methodology, vendored at `.agents/skills/skill-creator/` (development-only, never published or installed):

- Eval cases live in `evals/cases/<skill>.json`; a bridge converts them to skill-creator's per-skill `evals.json` format (`assertions` map to `expectations`)
- The executor shim maps vendored scripts' `claude -p` calls to `opencode run --model <pinned> --agent build --auto`; vendored grading logic is unmodified
- Each run directory carries `outputs/`, `timing.json`, and `grading.json` per the vendored `references/schemas.md`
- Each iteration produces `benchmark.json` (mean and stddev of pass rate, time, and tokens for `with_skill` vs `without_skill`, plus delta) and a `feedback.json` scaffold for human review
- Review uses `eval-viewer/generate_review.py --static`; improve-mode version progression is tracked in `history.json`

## 6. Non-Functional Requirements

| Requirement | Description |
|---|---|
| NFR-1: Skill body size | Full SKILL.md body under 5000 tokens |
| NFR-2: Startup overhead | Frontmatter loading under 100 tokens per skill |
| NFR-3: Retry limit | Max 3 retry iterations per subtask before escalation |
| NFR-4: Cross-platform | Works on Windows, Linux, and macOS |
| NFR-5: Progressive disclosure | Skills load full body on activation only, not at startup |

## 7. Scope

### In Scope

- 20 specialized subagents with documented roles
- 34 skills with progressive disclosure and verification checklists
- 1 active custom tool: quality-verifier (task-decomposer was deprecated and removed - see DECISIONS.md)
- 17 slash commands: /ship, /ship-pr, /fix, /plan, /review, /refactor, /audit, /simplify, /test, /tasks, /spec, /clean-branches, /commit, /explain, /brainstorm, /security, /docs
- Plugin registration via OpenCode plugin API
- File-based task tracking and persistence (`TASKS.md`)
- Development-only vendored tooling under `.agents/`: skill-creator (Python eval harness, executor shim) and plugin-dev (authoring reference)
- Documentation: PRD, AGENTS.md, DECISIONS.md, ARCHITECTURE.md, README.md, INSTALL.md, SPEC.md, TASKS.md

### Out of Scope

- opencode.jsonc permissions auto-write
- Instructions URL auto-write
- Custom notification plugins
- Custom chat export plugins
- Porting vendored Claude Code tooling to OpenCode format (plugin-dev stays as read-only reference; adaptation happens through shims and config, not rewrites)
- Multi-harness integration adapters (Claude Code, Codex CLI) in the current milestone; they are a backlog direction after the OpenCode integration layer stabilizes
