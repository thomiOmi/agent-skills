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

### 1. Test Cases (`evals/cases/<skill>.json`)

Define test prompts, expected outputs, and optional input files inside a per-skill case file under `evals/cases/`:

```json
{
  "skill_name": "task-decomposition",
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

### 2. Workspace & Baseline Runs

Run test cases in two configurations:
- **Baseline**: Prompt run without the skill
- **With Skill**: Prompt run with the skill activated

### 3. Assertion Grading & Human Review

- **Concrete Assertions**: Grade each assertion as PASS or FAIL with exact evidence from output files.
- **Human Feedback**: Record specific, actionable reviewer feedback.
- **Iteration Loop**: Feed failed assertions and reviewer feedback back to refine `SKILL.md` instructions until pass rate and output quality meet production standards.

---

## Vendored Eval Tooling (skill-creator)

The anthropics skill-creator plugin is vendored at `.agents/skills/skill-creator/` (source: anthropics/claude-plugins-official, `plugins/skill-creator`) as development-only tooling. It is never published, never installed by the CLI, and excluded from tsc and ESLint scans. Status: planned (vendor step lands with the evals/src refactor).

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
├── with_skill/<case-id>/
│   ├── prompt.txt
│   ├── outputs/            # executor output files (target)
│   ├── timing.json         # executor/grader/total durations (target)
│   ├── grading.json        # expectations[] + summary (target)
│   └── output.txt          # current raw executor output
├── without_skill/<case-id>/  # same structure, bare prompt
├── benchmark.json          # aggregate over cases (target)
├── feedback.json           # human review scaffold (target)
└── summary.json            # current aggregate (existing)
```

Items marked (target) close the gap against the vendored schemas.md; items marked (existing) are produced by the current runner. History tracking for improve mode (`history.json` with version, parent, expectation_pass_rate, grading_result, is_current_best) applies when the improve loop is adopted.

---

## Validation Test Suite

Run automated specification validation on all repository skills:

```bash
bun test tests/validate-skills.test.ts
```

## Running Evals

Scaffold and run evals for every skill that has a case file under `evals/cases/`:

```bash
bun scripts/evals/run-evals.ts --dry-run   # scaffold prompts only
bun scripts/evals/run-evals.ts             # run prompts via `opencode run` executor
bun scripts/evals/run-evals.ts --skill task-decomposition --iteration 2
```

The runner builds `evals/workspace/<skill>/iteration-N/` with a
`with_skill/` and `without_skill/` subdirectory per test case, writes
`prompt.txt` (skill body + user prompt, or bare prompt), `expected_output.txt`,
and `output.txt` (executor output), then a `summary.json` per iteration.
Passing `--executor "bunx promptfoo eval"` (or any shell command) swaps the
executor for grading or a different runtime.
