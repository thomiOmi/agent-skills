# Agent Skills Specification

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
├── assets/           # Optional: templates, schemas, resources
└── ...               # Any additional files or directories
```

Keep file references one level deep from `SKILL.md` (e.g. `references/REFERENCE.md`, `assets/template.md`). Avoid deeply nested reference chains, since agents load these files on demand and long chains make discovery harder.

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
2. **Instructions (< 5000 tokens / ~500 lines, recommended)**: Full `SKILL.md` body loaded when activated. This guideline is enforced as a hard check by `tests/validate-skills.test.ts`; bodies exceeding it will fail validation rather than produce a warning.
3. **Resources (On-demand)**: Files in `references/`, `scripts/`, or `assets/` loaded only when needed.

---

## Validation Test Suite

Run automated specification validation on all repository skills:

```bash
bun test tests/validate-skills.test.ts
```

For canonical specification validation, use the [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) reference library:

```bash
skills-ref validate ./my-skill
```

This checks that your `SKILL.md` frontmatter is valid and follows all naming conventions. The local `bun test` command is this repository's supplementary CI check.
