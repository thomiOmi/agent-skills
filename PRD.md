# PRD: agent-skills - Agent Orchestra for OpenCode

## 1. Problem Statement

The agent-skills project enables OpenCode users to work with a curated collection of specialized agents and skills. The current implementation uses OpenCode's built-in `plan` and `build` agents as the primary interface, with a Delegation & Verification Policy in global instructions that guides multi-step coordination through OpenCode's native `subagent` tool.

## 2. Goals

- Use OpenCode built-in `plan` and `build` agents as the primary user interface
- Provide a global delegation and verification policy for multi-step workflows
- Ship specialized agents for coding, testing, security, design, content, DevOps, documentation, brainstorming, planning, and refactoring
- Provide skills that support each agent role with domain-specific guidance
- Follow OpenCode conventions: agents as markdown, skills as SKILL.md
- Ship a harness-neutral skill catalog that needs no agent-side custom tools
- Keep the skill catalog harness-neutral (open Agent Skills format) so future agent runtimes beyond OpenCode can adopt it via an integration-layer adapter
- Follow the Agent Skills specification and repository authoring conventions
- Provide a safe ownership-aware installer that preserves user configuration and third-party files
- Enable non-developer users (vibe coders, sales, marketing, designers) to use the system effectively

## 3. Target Users

### Persona A - Developer End User

A software developer who writes code daily. Uses the agent orchestra to automate routine tasks, debug issues, and get expert-level help for specific concerns (security, testing, design).

### Persona B - Non-Developer End User

A vibe coder, sales person, marketer, or designer who uses AI agents for non-coding tasks. Describes features in plain language. Needs the primary agent to handle decomposition and execution without managing details.

### Persona C - Tech Lead / Reviewer

A senior engineer who reviews agent output before it reaches production. Needs visibility into what each subagent did, quality verification results, and clear audit trails.

### Persona D - Contributor

A contributor who wants to add new agents or skills to this repository. Needs documented conventions, consistent formats, and clear contribution guidelines.

## 4. User Stories

### Stories: Persona A - Developer End User

- As a developer, I want the primary agent to decompose complex tasks into subtasks and delegate them so I don't have to manually coordinate multiple agents.
- As a developer, I want specialized agents for coding, testing, security, and design so I get expert-level help for each concern.
- As a developer, I want every result verified before delivery so I don't ship broken code.
- As a developer, I want progressive skill loading so agent response stays fast.

### Stories: Persona B - Non-Developer End User

- As a vibe coder, I want to describe features in plain language so the primary agent handles decomposition and execution without me managing details.
- As a sales person, I want a marketing agent that drafts outreach copy so I can focus on closing deals.
- As a marketer, I want the copywriting skill with its content-strategy reference for SEO and copywriting so I can publish optimized content without hiring an agency.
- As a designer, I want the ui-ux agent to review my design system so accessibility and consistency are checked automatically.

### Stories: Persona C - Tech Lead / Reviewer

- As a tech lead, I want the primary agent to summarize what each subagent did so I can review and approve the implementation without reading every file.
- As a reviewer, I want quality verification (lint, typecheck, tests) before output so I don't waste time on code that fails basic checks.
- As a tech lead, I want max retry limits on subagent iterations so the system doesn't run indefinitely on failing tasks.

### Stories: Persona D - Contributor

- As a contributor, I want SKILL.md and agent definition formats documented so I can add new skills and agents consistently.
- As a contributor, I want documented conventions (permissions, checkpoint) so my additions follow the same patterns.

## 5. Functional Requirements

### FR-1: Workflow

The system follows this workflow for every task:

```text
discussion to classify to route to decompose to test to implement to review to verify to handoff
```

1. **Discussion** - user and agent interact to clarify requirements and confirm assumptions
2. **Classify & Route** - built-in primary `plan` agent identifies the task type and routes it: feature development through planning and file picking, bug investigation through root-cause analysis and research, or refactoring through file picking and planning
3. **Decompose & Delegate** - the primary agent decomposes the plan into subtasks and delegates to specialized subagents with the native `subagent` tool
4. **Test** - tests are written first (TDD approach)
5. **Implement** - code is implemented to pass the tests
6. **Review** - implementation is reviewed against requirements
7. **Verify** - quality verification runs the project's own lint, typecheck, and test commands plus the skill-level checklist
8. **Handoff** - decisions recorded in `DECISIONS.md`; OpenCode's built-in compaction carries the session objective and next move; durable backlog items go to the project's issue tracker
9. **Improve** - final polish and optimization after verification passes

If verification fails, the system retries from the implement step using the resumable `sessionID` (max 3 retries before escalation).

### FR-2: Agent Roster

The system provides the following agents:

| Agent | Mode | Role |
|---|---|---|
| frontend-developer | subagent | UI implementation, components, client state, styling |
| backend-developer | subagent | API endpoints, business logic, auth, server-side integration |
| software-architect | subagent | System design, ADRs, trade-off analysis, architecture review |
| database-engineer | subagent | Schema design, migrations, indexing, query performance |
| ai-engineer | subagent | Prompt engineering, AI integration, RAG, structured output |
| senior-developer | subagent | Tech lead: cross-domain review, standards, glue work, hard debugging |
| product-manager | subagent | PRDs, feature specs, user stories, roadmap |
| ui-ux | subagent | Design system, frontend, accessibility |
| marketing | subagent | Content, SEO, copy, strategy |
| qa-engineer | subagent | Test strategy, coverage, quality gates |
| devops | subagent | CI/CD, deployment, infrastructure |
| security-auditor | subagent | Security review, auth, vulnerability assessment |
| brainstormer | subagent | Creative ideation, solution exploration |
| deep-thinker | subagent | Complex reasoning, root cause analysis |
| researcher | subagent | Technical research, comparisons, evidence-based recommendations |
| project-manager | subagent | Project planning, milestone tracking, risk, status reports |
| data-analyst | subagent | SQL analysis, reporting, data profiling |
| docs-writer | subagent | Technical writing, documentation |
| refactor-planner | subagent | Safe refactoring, legacy code migration |

Delegation is performed by the primary agent through OpenCode's native `subagent` permission. Custom subagents do not grant `subagent` to one another, which prevents nested delegation loops.

> This table must stay in sync with the Agent Orchestra table in `AGENTS.md`, which
> is the canonical source for the agent roster. If they diverge, `AGENTS.md` wins.

### FR-3: Skills

The system provides 32 skills covering code quality, testing, security, design, DevOps, AI integration, planning, documentation, and research methodology.

- Skills follow SKILL.md format with frontmatter (name, description)
- Skills load progressively: frontmatter at startup (~100 tokens), full body on activation (< 5000 tokens)
- Skills end with a domain-specific verification checklist

### FR-4: Custom Tools

The system ships no custom tools. Verification and agent routing rely on the agents' own commands and prompts, which stay language-agnostic.

Tool history: none.

### FR-5: Verification

Every skill includes a domain-specific verification checklist at the end of its SKILL.md. The primary agent runs the skill-level checklist before the project quality gate.

Dual-layer verification:
1. **Skill-level** - domain-specific checks (e.g., security checks for auth, coverage checks for tests)
2. **Project quality gate** - the agent runs the project's own cross-cutting commands (lint, typecheck, tests), whatever the language or framework

### FR-6: Persistence & Handoff

Live task state stays in the conversation and, when durable, in the project's issue tracker. Decisions are recorded in `DECISIONS.md`, structural knowledge in `SPEC.md`/`ARCHITECTURE.md`, and OpenCode's built-in compaction carries the session objective and next move. The system ships no project-local task file.

### FR-7: Plugin

The plugins register lifecycle hooks via the OpenCode V2 plugin API: secret scanning and destructive-command guarding. Each plugin is a default definition with a stable ID and a `setup` function. Agents, skills, and commands are discovered from the installed directories rather than registered by the plugin. Compaction is handled natively by OpenCode V2.

### FR-8: Installer

The installer deploys agents, skills, commands, plugin hooks, global instructions, and config templates into the OpenCode global config root.

- Default mode is merge: update managed files, preserve user-modified and unmanaged files, and delete stale managed files only when unmodified.
- Replace mode is explicit and aborts on unmanaged conflicts unless `--force` is set.
- Symlink mode remains available for live development and falls back to a copy when symlinks are unavailable.
- Copy mode is a deprecated alias for replace.
- The ownership manifest at `<configRoot>/.agent-skills-manifest.json` records SHA-256 hashes and drives create, update, delete, and keep decisions.
- The first run without a manifest adopts existing files at shipped paths and backs them up first.
- The installer writes only under the OpenCode config root. It never writes `~/.agents/`.
- Config merge preserves user values, unknown keys, and V2 keys; arrays are atomic; `default_agent` and `small_model` are never forced; `instructions` appends `AGENTS.md` only when missing; a top-level `subagent_depth` migrates to `experimental.subagent_depth`.
- Invalid config aborts in merge mode unless `--force` is set.
- Backups cover the config root and run only when files or configs will change.
- Path containment rejects source paths that escape the config root.

## 6. Non-Functional Requirements

| Requirement | Description |
|---|---|
| NFR-1: Skill body size | Full SKILL.md body under 5000 tokens |
| NFR-2: Startup overhead | Frontmatter loading under 100 tokens per skill |
| NFR-3: Retry limit | Max 3 retry iterations per subtask before escalation |
| NFR-4: Cross-platform | Works on Windows, Linux, and macOS |
| NFR-5: Progressive disclosure | Skills load full body on activation only, not at startup |
| NFR-6: Install safety | Default merge preserves user-modified and third-party files; unmanaged conflicts require explicit `--force` |
| NFR-7: Install determinism | Identical repository and config inputs produce the same plan and manifest, with sorted paths and content hashes |

## 7. Scope

### In Scope

- 19 specialized subagents with documented roles
- 32 skills with progressive disclosure and verification checklists
- No custom tools
- 2 slash commands: /commit, /ship-pr
- Plugin registration via OpenCode V2 plugin API
- Ownership-aware installer with merge, replace, and symlink modes, a manifest, config merge, backups, and config-root-only writes
- Conversation-based task state, issue-tracker mirroring, and built-in compaction for cross-session handoff
- Authoring standards: agentskills.io for skills and OpenCode conventions for integration files
- Documentation: PRD, AGENTS.md, DECISIONS.md, ARCHITECTURE.md, README.md, INSTALL.md, SPEC.md

### Out of Scope

- Writing `~/.agents/` compatibility copies
- Uninstall and automated restore commands in the current milestone; backups are restored manually
- Comment-preserving JSONC rewrites; comments are lost with a warning when a rewrite is required
- opencode.jsonc permissions auto-write
- Instructions URL auto-write
- Custom notification plugins
- Custom chat export plugins
- Porting external harness tooling into the current milestone; future harness support belongs in integration-layer adapters
- Multi-harness integration adapters (Claude Code, Codex CLI) in the current milestone; they are a backlog direction after the OpenCode integration layer stabilizes
