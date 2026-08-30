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
