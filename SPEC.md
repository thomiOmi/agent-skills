# Agent Skills Specification

The skills in this repository follow the official Agent Skills format.

Full specification: <https://agentskills.io/specification>

---

## Quick Reference

### SKILL.md Frontmatter

| Field | Required | Notes |
| --- | --- | --- |
| `name` | ✅ | Max 64 chars. Lowercase, numbers, hyphens only. Must match directory name. |
| `description` | ✅ | Max 1024 chars. What it does + when to use it. |
| `license` | No | License name or reference to LICENSE file. |
| `compatibility` | No | Max 500 chars. Environment requirements. |
| `metadata` | No | Key-value map for additional info (e.g. `version`, `author`). |
| `allowed-tools` | No | Space-separated pre-approved tools. Experimental. |

### Directory Structure

```text
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: detailed documentation loaded on-demand
└── assets/           # Optional: templates, schemas, resources
```

### Progressive Disclosure

Skills are loaded progressively — keep this in mind when writing:

1. `name` + `description` → loaded at startup for all skills (~100 tokens)
2. Full `SKILL.md` body → loaded when skill is activated (keep under 5000 tokens / 500 lines)
3. `references/`, `scripts/`, `assets/` → loaded on-demand only

Move detailed reference material to `references/` to keep `SKILL.md` lean.

### Validation

```bash
skills-ref validate ./skills/my-skill
```

See: <https://github.com/agentskills/agentskills/tree/main/skills-ref>
