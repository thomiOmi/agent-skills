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

### 1. Test Cases (`evals/evals.json`)

Define test prompts, expected outputs, and optional input files inside `evals/evals.json`:

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

### 2. Workspace & Baseline Runs

Run test cases in two configurations:
- **Baseline**: Prompt run without the skill
- **With Skill**: Prompt run with the skill activated

### 3. Assertion Grading & Human Review

- **Concrete Assertions**: Grade each assertion as PASS or FAIL with exact evidence from output files.
- **Human Feedback**: Record specific, actionable reviewer feedback.
- **Iteration Loop**: Feed failed assertions and reviewer feedback back to refine `SKILL.md` instructions until pass rate and output quality meet production standards.

---

## Validation Test Suite

Run automated specification validation on all repository skills:

```bash
bun test tests/validate-skills.test.ts
```

## Running Evals

Scaffold and run evals for every skill that ships an `evals/evals.json`:

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
