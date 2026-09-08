# Agent Skills Audit

Audit date: 2026-08-29
Scope: all skills (34 directories), agents (16), installer/CLI, eval tooling, and distribution model.

Reference sources used for the review:

- GSD Core (docs.opengsd.net/core) - spec-driven framework: phase loop, persistent artifacts, verification, multi-runtime install
- anthropics/claude-plugins-official - plugin structure and marketplace conventions (.claude-plugin/plugin.json, skill bundles)
- anthropics/knowledge-work-plugins - role-based plugin bundles, connectors, file-based customization
- affaan-m/ecc - agent harness optimization: memory vault, token optimization, continuous learning, security, evals
- voltagent.dev - agent framework with evals and observability platform

---

## Methodology

Each skill and agent was reviewed against six dimensions:

1. Spec compliance (agentskills.io: frontmatter, name rules, body size)
2. Progressive disclosure (metadata at startup, body on activation, references on demand)
3. Verification (per-skill checklist, centralized quality-verifier)
4. Security and trust boundaries
5. Token budget (description length, body size)
6. Distribution and eval coverage

Automated checks used: tests/validate-skills.test.ts (spec), tests/evals-validation.test.ts (eval format), grep-based pattern scans across all markdown files.

---

## What Is Working Well

- All 34 skills pass agentskills.io spec validation (frontmatter keys, name regex, 500-line body limit).
- Content-heavy skills ship references/ and assets/ subdirectories; progressive disclosure is respected.
- Descriptions are trigger-rich and state when to load the skill proactively.
- Dual-layer verification exists in concept: per-skill checklist plus quality-verifier tool.
- Per-skill license and metadata versioning is consistent.
- CI validates spec and eval format; hooks enforce lint, commit format, typecheck, tests.
- Installer is complete: single install command, copy/symlink/merge modes, giget remote source, bin entry for bunx, full unjs stack (citty, consola, c12, pkg-types, std-env, scule, ufo, giget, defu, pathe, confbox).

---

## Findings

### F1: Double-space artifact in markdown (67 of 107 files)

The earlier em dash cleanup left "-  " (hyphen followed by two spaces) across skills/ markdown files. It is invisible in rendered markdown but noisy in diffs and violates the formatting intent.

Affected: 67 of 107 files under skills/.
Fix: bulk replace "-  " with "- ". Mechanical, no content change.

### F2: Three skills lack the verification checklist (FR-5 violation)

PRD FR-5 requires every skill to end with a domain-specific verification checklist. Missing in:

- sdlc-documentation
- system-design
- task-decomposition

Fix: append a checklist consistent with each skill's domain.

### F3: Eval coverage is 1 of 34 skills

Only task-decomposition has evals/evals.json. The runner (scripts/evals/run-evals.ts) scaffolds baseline vs with_skill runs and stores outputs, but:

- No assertion grading step (outputs are stored, not scored)
- No comparison report (baseline vs skill pass rate)

Fix: add evals.json to core skills (code-style, testing, security-review, git-workflow), then extend the runner with assertion grading and a summary report.

### F4: Agent permission drift vs DECISIONS.md convention

DECISIONS.md says bash access only for agents that need to run tests. Current state: docs-writer, product-manager, and data-analyst have bash: allow although their workflows never run tests. security-auditor, ui-ux, marketing do not need edit either but have it.

Fix: tighten permissions (bash: deny or ask where unneeded) and restate the convention in DECISIONS.md to match reality: edit allow only for artifact writers, bash denied unless tests or tooling must run.

### F5: Distribution as a multi-runtime plugin (strategic)

The repo is OpenCode-shaped. The claude-plugins-official and ECC references show the same content serving many harnesses (Claude Code, Codex, Cursor, Gemini CLI) via a .claude-plugin/plugin.json manifest plus skills array. Adding a plugin manifest would let this collection be consumed as a Claude Code plugin without changing the OpenCode shape.

Effort: medium. Add manifest + install target, no content change.

### F6: Cross-session handoff artifact (strategic)

GSD Core uses continue-here.md and ECC uses structured memory handoffs so a new session resumes instantly. Current persistence is TASKS.md only. Adding a "continue here" section convention to task-decomposition (or a new handoff skill) would improve resumability.

Effort: low (skill text) to medium (tooling).

### F7: Security and trust-boundary guidance in skills

ECC emphasizes that fetched or recalled content is unreviewed context, never executable policy, and warns about prompt injection. research-methodology (webfetch) and ai-integration currently lack such guidance.

Fix: add a short trust-boundary section to research-methodology and ai-integration.

### F8: Installer and CLI (no action)

Complete per audit: no dead code found. deploy.ts, sync.ts, and symlink.ts are implementation modules behind install.ts modes, not leftovers.

---

## Priorities

| Priority | Item | Effort |
|---|---|---|
| P1 | F1 double-space cleanup, F2 add missing checklists | Low, mechanical |
| P2 | F3 eval coverage and runner grading | Medium |
| P3 | F4 permission tightening and convention update | Low |
| P4 | F5 plugin manifest, F6 handoff artifact, F7 trust boundaries | Medium, strategic |

P1 is implemented in the same series as this report. P2 to P4 are tracked in TASKS.md backlog.

---

# Audit Update: 2026-09-08

Scope: 29-skill catalog after the granularity consolidation (38 to 29 skills, PR #28 to #30) and the eval runner upgrade (PR #31). Reference standard: agentskills.io specification and the six audit dimensions above.

## Automated scan results

- Spec validation: all 29 skills pass tests/validate-skills.test.ts.
- Eval coverage: 29 of 29 skills ship eval case files under evals/cases/ (71 cases, all schema-validated; runner now grades assertions deterministically with --limit support).
- Verification checklist: 29 of 29 skills end with a checklist section (FR-5 satisfied).
- Trigger routing: tests/trigger-collision.test.ts guards against duplicate trigger phrases, self-repeats, and cross-skill file path references.
- Progressive disclosure: content-heavy skills (ai-integration, database, devops-deployment, security-review, git-workflow, planning, sdlc-documentation) ship references/; bodies stay within token budget.

## Content depth findings

Body word counts range from 159 (structured-output) to 1206 (no-ai-slop). Thin is not automatically bad, but four skills under 200 words lacked concrete failure guidance and shipped only happy-path rules:

- structured-output (159 words)
- seo-optimization (189 words)
- copywriting (190 words)
- test-planning (192 words)

Fixed in this series: each gained a "Common Pitfalls" section (five domain-specific anti-patterns with corrective guidance) and a version bump to 1.1.0.

Assessed as adequate despite low word count (focused, actionable, template- or framework-driven): architecture-decision, code-review, prompt-design, tech-debt, code-simplifier.

## Domain gaps (recommendations, not implemented)

Given the trigger-collision history, new skills require deliberate routing analysis before creation. Candidates identified:

1. Observability and monitoring (logging, metrics, tracing, alerting): currently a subsection inside devops-deployment. Split only if routing demand justifies it.
2. Performance optimization (profiling, caching, database query tuning): currently spread across debugging and database. Highest demand signal from eval prompts.
3. Frontend state management: no coverage at all; niche, defer until requested.
4. Accessibility (a11y): partially covered in ui-design; a dedicated skill is justified only for deep WCAG auditing workflows.

Recommendation: none of these are urgent. Revisit after the deterministic eval runner has been executed against real outputs to see which domains actually underperform.

## Backlog status from prior audit

- F3 eval coverage and runner grading: done (this series).
- F4 permission tightening: done previously.
- F5 plugin manifest for multi-runtime distribution: open, strategic, not started.
- F6 cross-session handoff artifact: done (verified 2026-09-08: task-decomposition includes a Session Handoff section that writes a Continue Here resume point into TASKS.md; added alongside F7 on 2026-08-30).
- F7 trust-boundary guidance in research-methodology and ai-integration: done (verified 2026-09-08: both skills already contain a Trust Boundaries section covering untrusted fetched content, prompt injection, and output validation; the original audit finding was stale).
