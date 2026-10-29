# Skill Catalog Map

Cross-skill referral graph, boundary clarifications, and open decisions for the 35 skills in `skills/`. Skills are loosely coupled via explicit "load this skill" by-name pointers. No skill depends on another at runtime; pointers are activation-time delegations per SPEC.md progressive disclosure.

## Cross-Skill Referral DAG

| From skill | Refers to | Reason |
|---|---|---|
| task-decomposition | code-style | Writing or reviewing any code |
| task-decomposition | testing | Writing or reviewing tests |
| task-decomposition | api-conventions | Designing or modifying an API |
| task-decomposition | documentation | Writing or updating docs |
| task-decomposition | planning | Designing schema, ERD, or system plan |
| task-decomposition | sdlc-documentation | Writing PRD, SDD, user stories, requirements |
| task-decomposition | debugging | A bug or unexpected failure |
| task-decomposition | ai-integration | Integrating an LLM or AI service |
| project-lifecycle | task-decomposition | Break one phase into ordered subtasks |
| project-lifecycle | sdlc-documentation | Write the PRD and acceptance criteria |
| project-lifecycle | planning | Architecture decisions in the Design phase |
| project-lifecycle | devops-deployment | Release mechanics and deployment |
| project-lifecycle | code-review | Verification loop in Development |
| project-lifecycle | testing | Verification loop in Development |
| memory-management | task-decomposition | Decomposing new work into tasks |
| memory-management | architecture-decision | Recording an architectural trade-off |
| memory-management | sdlc-documentation | Writing or updating a spec or PRD |
| memory-management | planning | Diagramming structure after structural change |
| memory-management | debugging | Discrepancy between notes and actual behavior |
| backend-patterns | api-conventions | Endpoint/request-response design |
| backend-patterns | database | Schema and query structure behind repositories |
| backend-patterns | database-migration | Migration planning |
| database | database-migration | Planning or running a schema migration |
| frontend-patterns | ui-design | Component and visual implementation |
| frontend-patterns | ui-design | Styling systems and tokens |
| frontend-patterns | api-conventions | API shape behind the fetch layer |
| ai-integration | prompt-design | Designing or refining prompt structure |
| ai-integration | structured-output | JSON output contracts and response parsing |
| content-strategy | copywriting | Landing page copy and CTA formulas |
| content-strategy | seo-optimization | Meta tags, heading structure, keyword research |
| documentation | architecture-decision | Architecture Decision Records |
| config-management | code-style | Application code conventions |
| config-management | devops-deployment | CI pipeline design, deployment, infrastructure |
| config-management | database | Database schema and migrations |
| data-analysis | database | Query optimization, indexing, schema design |
| planning | sdlc-documentation | PRD, SDD, user stories, MVP scope, timelines |
| api-conventions | documentation | OpenAPI spec generation |
| testing | test-planning | Test strategies, QA entry/exit criteria, coverage targets |
| test-planning | testing | Writing unit, integration, snapshot, and contract tests |
| code-simplifier | tech-debt | Identifying tech debt to prioritize simplification targets |
| tech-debt | code-simplifier | Executing behavior-preserving simplification of identified debt |
| debugging | code-simplifier | When the fix requires simplifying complex nested logic |
| debugging | tech-debt | When the bug stems from accumulated technical debt |
| code-review | security-review | Deep security audit beyond surface-level checks |
| architecture-decision | planning | Broader system architecture context beyond a single ADR |
| sdlc-documentation | architecture-decision | Recording ADRs for significant decisions |

## Boundary Clarifications

### content-strategy vs documentation

`content-strategy` owns public-facing marketing content (email campaigns, blog posts, social media, brand voice). `documentation` owns technical/project documentation (README, CHANGELOG, OpenAPI specs, setup guides, API docs). `content-strategy` must not claim "technical documentation" as its own surface; technical documentation is delegated to `documentation`.

### ui-design vs design-md

`ui-design` owns design principles, accessibility checklists, component states, and token guidelines. `design-md` owns the `DESIGN.md` file format (YAML frontmatter tokens plus markdown prose) and its canonical section order. `ui-design` points to `design-md` for the file format; `design-md` points to `ui-design` for token principles.

### code-style vs code-simplifier vs code-review

`code-style` owns naming, docstrings, comments, and structure conventions. `code-simplifier` owns behavior-preserving simplification (flatten conditionals, remove dead code). `code-review` owns PR/audit review across correctness, security, testing, maintainability. Style belongs to automated lint, not to the reviewer's time per `code-review`.

### config-management vs devops-deployment

`config-management` owns editing project configuration files (package.json, tsconfig, eslint config, CI files, .env.example, opencode.jsonc). `devops-deployment` owns CI pipeline design, deployment, and infrastructure. Config file edits go to `config-management`; pipeline design goes to `devops-deployment`.

### security-review vs code-review

`code-review` checks surface-level security (no hardcoded secrets, auth gaps). `security-review` performs deep OWASP Top 10 audits. `security-auditor` is the sole agent that loads `security-review`. `senior-developer` loads `code-review` but not `security-review`, so security review in tech-lead flows is surface-level only. This is a coverage gap, not a contradiction.

## Domain-Gap Assessment

Four domain-gap candidates were evaluated (from TASKS.md backlog). No new skills were created because no dedicated agent owns any of these domains, and creating unreferenced skills would violate the one-skill-per-agent-moment principle.

| Candidate | Current coverage | Decision | Rationale |
|-----------|-----------------|----------|-----------|
| Observability & monitoring | devops-deployment (triggers: monitoring setup, observability, metrics, alerts, SRE; Monitoring Checklist) | Keep as subsection | Adequate coverage; no dedicated `observability` agent exists to own a new skill |
| Performance optimization | debugging (diagnosis of slowness) + database (query optimization, N+1, indexing) | Keep distributed | Coverage split by domain; no dedicated `performance` agent; general app performance addressable via debugging + database + frontend-patterns |
| Frontend state management | frontend-patterns (state ownership: server/shared client/local) | Keep in frontend-patterns | Genuine gap for library selection (Zustand, Redux, React Query, SWR) but no dedicated `frontend-state` agent to route to; strongest future candidate |
| Accessibility | ui-design (WCAG, a11y, ARIA, keyboard, screen reader; 10-item checklist; references/accessibility.md) | Keep in ui-design | Adequate coverage as part of UI design; no dedicated `accessibility` agent |

Strongest future candidate: frontend state management — revisit if routing demand emerges or a dedicated agent is added.

## Open Decisions

### refactor-planner skill absence

No `skills/refactor-planner/` directory exists. The `refactor-planner` agent loads `tech-debt`, `planning`, `architecture-decision`, and `code-simplifier` instead. Refactoring is distributed across those skills rather than owned by a first-class `refactor-planner` skill. Confirm whether this is intentional or whether a `refactor-planner` SKILL.md should be added and wired into the `refactor-planner` agent and AGENTS.md Key Skills.

### security-review coverage for senior-developer

Decide whether to add `security-review` to `senior-developer` Key Skills / `skills_to_load`, or keep `security-auditor` as the sole owner of security review.
