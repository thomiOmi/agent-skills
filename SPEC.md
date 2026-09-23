# Agent Skills Specification & Evaluation Guide

The skills in this repository follow the official Agent Skills format and evaluation standards.

Full specification: <https://agentskills.io/specification>
Evaluating skills: <https://agentskills.io/skill-creation/evaluating-skills>

---

## Specification Reference

### Directory Structure

```text
skill-name/
├── SKILL.md          # Required: metadata + instructions (YAML frontmatter + Markdown)
├── scripts/          # Optional: executable code/utilities
├── references/       # Optional: detailed documentation loaded on-demand
└── assets/           # Optional: templates, schemas, resources
```

### Frontmatter Schema

| Field | Required | Constraints |
|---|---|---|
| `name` | Yes | 1-64 chars. Lowercase alphanumeric + single hyphens (`^[a-z0-9]+(-[a-z0-9]+)*$`). Must match parent directory name. |
| `description` | Yes | 1-1024 chars. Non-empty. Describes what the skill does and when to use it. |
| `license` | No | Short license identifier (e.g. `MIT`, `Apache-2.0`). |
| `compatibility` | No | Max 500 chars. Environment requirements. |
| `metadata` | No | String-to-string map for custom properties (e.g., `version`, `author`). |
| `allowed-tools` | No | Space-separated string of pre-approved tools. (Experimental) |

### Progressive Disclosure

Agents load skills progressively to optimize context window efficiency:

1. **Metadata (~100 tokens)**: `name` + `description` loaded at startup for discovery.
2. **Instructions (< 5000 tokens / 500 lines)**: Full `SKILL.md` body loaded when activated.
3. **Resources (On-demand)**: Files in `references/`, `scripts/`, or `assets/` loaded only when needed.

---

## Evaluating Skill Quality (Evals)

To verify that a skill produces reliable outputs across varied prompts, follow the eval-driven iteration pattern:

### 1. Test Cases (`evals/cases/<name>.json`)

Define test prompts, expected outputs, and optional input files inside a per-skill case file under `evals/cases/`:

```json
{
  "skill_name": "task-decomposition",
  "target": "skill",
  "evals": [
    {
      "id": 1,
      "prompt": "Refactor authentication module to support OAuth2 with Google and GitHub",
      "expected_output": "Structured TASKS.md breaking work into Active subtasks with assigned subagents and clear phase breakdown.",
      "assertions": [
        "Outputs a valid TASKS.md structure",
        "Includes active subtasks with assigned subagents",
        "Identifies security review as a dependency"
      ]
    }
  ]
}
```

Eval case files are centralized under `evals/cases/` (one file per skill, named `<skill>.json`) instead of living inside each skill directory, because they are maintainer tooling and should not be shipped to users who install the skills. Optional fixture files for a case live under `evals/cases/<skill>.files/` and are referenced by the `files` array relative to that directory.

A case file evaluates a skill by default. Set `"target": "agent"` to evaluate an agent (`agents/<skill_name>.md`, field name stays `skill_name`) instead; the runner then uses `with_agent`/`without_agent` mode directories and wraps the agent definition into the with-agent prompt.

### Eval Targets: Skills and Agents

The optional `target` field selects what `skill_name` refers to:

- `"skill"` (default, backward compatible): evaluates `skills/<name>/SKILL.md` with `with_skill`/`without_skill` mode directories. The `with_skill` prompt wraps the task with the skill body.
- `"agent"`: evaluates `agents/<name>.md` with `with_agent`/`without_agent` mode directories. The `with_agent` prompt wraps the task with the agent definition (role, responsibilities, constraints).

The `--target skill|agent` CLI flag filters the run to case files with that declared target type (other case files are skipped, not overridden). A target whose definition file is missing fails validation before any executor spend, with a hint about the other target type, so a mistyped target never produces an A/B pair where both sides are identical. `benchmark.json` uses the mode names as configuration labels (`with_agent`/`without_agent` for agent targets), which the vendored `aggregate_benchmark.py` aggregates the same way as skill configurations.

### 2. Workspace & Baseline Runs

Run test cases in two A/B configurations per target type:
- **Baseline**: Prompt run without the skill (without_skill) or agent (without_agent)
- **With Target**: Prompt run with the skill (with_skill) or agent (with_agent) definition included

### 3. Assertion Grading & Human Review

- **Concrete Assertions**: Grade each assertion as PASS or FAIL with exact evidence from output files.
- **Human Feedback**: Record specific, actionable reviewer feedback.
- **Iteration Loop**: Feed failed assertions and reviewer feedback back to refine `SKILL.md` instructions until pass rate and output quality meet production standards.

---

## Vendored Eval Tooling (skill-creator)

The anthropics skill-creator plugin is vendored at `.agents/skills/skill-creator/` (source: anthropics/claude-plugins-official, `plugins/skill-creator`) as development-only tooling. It is never published, never installed by the CLI, and excluded from tsc and ESLint scans. Status: vendored (2026-09-21, see TASKS.md Fase 2).

Contents used by this repo:

| Upstream asset | Purpose here |
|---|---|
| `scripts/run_eval.py`, `run_loop.py` | Per-case eval execution and description-optimization loops (executor shim: `claude -p` becomes `opencode run --model <pinned> --agent build --auto`) |
| `scripts/aggregate_benchmark.py` | Produces `benchmark.json` per iteration (mean and stddev of pass rate, time, tokens, plus delta) |
| `scripts/generate_report.py`, `improve_description.py`, `package_skill.py`, `quick_validate.py` | Reporting, description improvement, packaging, validation |
| `eval-viewer/generate_review.py` | Human review UI; run with `--static <output.html>` for a standalone file, emits `feedback.json` |
| `agents/grader.md`, `comparator.md`, `analyzer.md` | Grading, blind A/B comparison, and post-hoc analysis subagent instructions |
| `references/schemas.md` | Authoritative JSON schemas for evals.json, grading.json, benchmark.json, history.json, comparison.json, analysis.json |

Case bridge: `evals/cases/<skill>.json` (this repo's centralized format) converts to skill-creator's per-skill `evals.json` on the fly. Field mapping: `assertions` becomes `expectations`, `expected_output` passes through verbatim, `files` references resolve relative to `evals/cases/<skill>.files/`.

### Artifact Layout (target state)

Per skill iteration under `evals/workspace/<skill>/iteration-N/`:

```text
iteration-N/
├── with_skill/<case-id>/        # skills (or with_agent/ for agent targets)
│   ├── prompt.txt
│   ├── outputs/                 # executor output files
│   ├── graded/timing.json       # executor duration
│   ├── graded/grading.json      # expectations[] + summary
│   └── output.txt               # raw executor output
├── without_skill/<case-id>/     # bare prompt (or without_agent/ for agent targets)
├── benchmark.json               # aggregate over cases
├── history.json                 # improve-loop progression
├── feedback.json                # human review scaffold
└── summary.json                 # current aggregate
```

Items marked (target) in earlier revisions have all landed: the runner emits the full per-run and per-iteration artifact set described above. History tracking for improve mode (`history.json` with version, parent, expectation_pass_rate, grading_result, is_current_best) records each iteration.

---

## Validation Test Suite

Run automated specification validation on all repository skills:

```bash
bun test tests/validate-skills.test.ts
```

## Running Evals

Scaffold and run evals for every skill that has a case file under `evals/cases/`:

```bash
bun run evals --dry-run                                # scaffold prompts only
bun run evals                                          # run prompts via `opencode run` executor
bun run evals --skill task-decomposition --iteration 2
bun run evals --skill security-auditor                 # agent case file (target: "agent" in the JSON)
bun run evals --target agent                           # only agent-targeted case files
```

The runner builds `evals/workspace/<skill>/iteration-N/` with
`with_skill/` and `without_skill/` subdirectories per test case (or
`with_agent/` and `without_agent/` for agent targets), writes `prompt.txt`
(target body + user prompt, or bare prompt), `expected_output.txt`,
`outputs/output.txt`, `graded/grading.json`, and `graded/timing.json`, then a
`summary.json`, `benchmark.json`, and `history.json` per iteration. Passing
`--executor "bunx promptfoo eval"` (or any shell command) swaps the executor
for grading or a different runtime.
