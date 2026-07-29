# PRD: agent-skills - Agent Orchestra for OpenCode

## 1. Problem Statement

The agent-skills project previously focused on a TypeScript plugin that syncs skills and agents to the user's OpenCode config directory. This approach duplicated OpenCode's built-in discovery mechanisms (`.opencode/agents/`, `.opencode/tools/`, `~/.config/opencode/skills/`) and required complex installer logic (`src/`) that is better handled by OpenCode itself.

The new direction: **Agent Orchestra** - a curated collection of specialized agents, skills, and custom tools that turn OpenCode into a multi-role development team. The primary agent delegates to sub-agents via verification loops, mimicking real-world engineering orgs.

## 2. Goals

- Provide a **primary agent** with a verification loop: decompose to delegate to collect to verify to iterate.
- Ship **real-world agency roles**: senior-developer, ui-ux, marketing, qa-engineer, devops, security-auditor.
- Provide **skills** that support each agent role with deep, role-specific guidance.
- Provide **custom tools** under `tools/` that agents can use.
- Eliminate `src/` - no installer, no config manipulator, no MCP auto-config.
- Keep plugin minimal: only register agents/skills/tools, no file sync logic.
- Full OpenCode v2 compliance: agents as markdown, skills as SKILL.md, custom tools as TypeScript.
- Architecture is documented in `ARCHITECTURE.md`. This PRD covers product requirements only.

## 3. Target Users

- OpenCode users who want a multi-agent development workflow.
- Developers who want specialized agents (senior developer, UI/UX, QA, DevOps, marketing, security) at their fingertips.
- Teams that practice verification loops and quality gates before shipping.

## 4. Product Requirements

### 4.1 Agents

The product ships 11 specialized agents plus integrates with OpenCode built-in agents. See `ARCHITECTURE.md` for the full agent roster and routing.

| Requirement | Priority |
|---|---|
| Primary agent orchestrates via verification loop | P0 |
| Subagents cover coding, design, QA, DevOps, security, content, docs, planning | P0 |
| Built-in agents (build, plan, explore, scout, general) remain usable | P0 |
| Max 3 retry iterations per subtask before escalating to user | P1 |

### 4.2 Skills

15 skills covering code, testing, security, design, DevOps, AI, planning, documentation. See `ARCHITECTURE.md` for the full skills-to-agent mapping.

| Requirement | Priority |
|---|---|
| Skills follow progressive disclosure (name + description at startup, full body on activation) | P0 |
| Skills stay under 5000 tokens for the main SKILL.md body | P1 |

### 4.3 Custom Tools

Two tools: `task-decomposer.ts` and `quality-verifier.ts`. See `ARCHITECTURE.md` for input/output specs.

| Requirement | Priority |
|---|---|
| task-decomposer infers agent from keyword matching on description | P0 |
| quality-verifier checks lint, typecheck, tests, debug statements, docstrings | P0 |

## 5. Verification Loop

The primary agent follows a 7-step verification loop for every delegation. See `ARCHITECTURE.md` for the detailed flow diagram and retry logic.

| Requirement | Priority |
|---|---|
| Verify every delegation before synthesis | P0 |
| Max 3 retries before escalating to user | P0 |

## 6. Directory Structure

See `ARCHITECTURE.md` for the full directory tree.

Root documentation files and their roles:

| File | Role |
|---|---|
| `PRD.md` | Product requirements (this file) |
| `ARCHITECTURE.md` | System architecture |
| `DECISIONS.md` | Architectural decisions, conventions, known issues |
| `AGENTS.md` | Project-level agent instructions (read by OpenCode) |
| `TASKS.md` | Roadmap and backlog |
| `SPEC.md` | Agent Skills format specification |
| `README.md` | Overview and quick start |
| `INSTALL.md` | Setup guide |

## 7. Relationship with OpenCode Built-in Agents

| OpenCode Built-in    | Our Addition          | Relation                                    |
| -------------------- | --------------------- | ------------------------------------------- |
| `build` (primary)    | -                     | Default dev agent, keep as-is               |
| `plan` (primary)     | -                     | Analysis agent, keep as-is                  |
| `general` (subagent) | -                     | Generic helper, keep as-is                  |
| `explore` (subagent) | -                     | Codebase explorer, keep as-is               |
| `scout` (subagent)   | -                     | External research, keep as-is               |
| -                    | `primary` (mode: all) | Verification loop agent, selectable via Tab |
| -                    | `senior-developer`    | Architecture and coding specialist          |
| -                    | `ui-ux`               | Design and frontend specialist              |
| -                    | `marketing`           | Content and SEO specialist                  |
| -                    | `qa-engineer`         | Testing and quality specialist              |
| -                    | `devops`              | CI/CD and deployment specialist             |
| -                    | `security-auditor`    | Security review specialist                  |

Our agents **complement** built-in agents. Users can Tab between `build`, `plan`, and `primary`.

## 8. Custom Tools

Two custom tools — `task-decomposer.ts` and `quality-verifier.ts`. See `ARCHITECTURE.md` for input/output specs.

| Tool | Purpose | Used By |
|---|---|---|
| task-decomposer | Break complex tasks into structured subtasks with agent inference | primary |
| quality-verifier | Verify code quality: lint, typecheck, tests, debug statements, docstrings | primary (via qa-engineer) |

## 9. Out of Scope

- MCP server auto-configuration
- opencode.jsonc permissions auto-write
- Instructions URL auto-write
- GitHub Actions CI changes (kept as-is)
- Any installer or sync logic beyond plugin registration
- Shell installer scripts

## 10. Related Documents

| Document | Role |
|---|---|
| `ARCHITECTURE.md` | System architecture, agent roster, verification loop, skills mapping, directory structure, deployment |
| `DECISIONS.md` | Architectural decisions, conventions, known issues |
| `AGENTS.md` | Project-level agent instructions (read by OpenCode each session) |
| `TASKS.md` | Roadmap, backlog, project progress |
| `SPEC.md` | Agent Skills format specification |
| `INSTALL.md` | Setup guide for humans |
