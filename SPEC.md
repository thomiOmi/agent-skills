# Agent Skills Specification

The skills in this repository follow the official Agent Skills format and evaluation standards.

Full specification: <https://agentskills.io/specification>
Evaluating skills: <https://agentskills.io/skill-creation/evaluating-skills>

---

## Specification Reference

### Directory Structure

```text
skill-name/
|-- SKILL.md          # Required: metadata + instructions (YAML frontmatter + Markdown)
|-- scripts/          # Optional: executable code/utilities
|-- references/       # Optional: detailed documentation loaded on-demand
\-- assets/           # Optional: templates, schemas, resources
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

## Validation Test Suite

Run automated specification validation on all repository skills:

```bash
bun test tests/validate-skills.test.ts
```
