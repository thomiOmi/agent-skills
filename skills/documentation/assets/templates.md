# Documentation Templates

## README Skeleton

```markdown
# [Project Name]

[One paragraph: what it does and who it is for.]

## Quick Start

\```bash
cp .env.example .env
[package-manager] install
[run-command]
\```

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KEY` | Yes | — | [Description] |

## Development

\```bash
[test-command]
[lint-command]
\```
```

## ADR Skeleton

```markdown
# ADR [NNN]: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated

## Context
[What situation prompted this decision?]

## Decision
[What did we decide?]

## Rationale
[Why this option? What tradeoffs?]

## Consequences
[What becomes easier or harder?]

## Alternatives Considered
- [Option A] — rejected because [reason]
```
