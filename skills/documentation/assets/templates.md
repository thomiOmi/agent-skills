# Documentation Templates

## README Skeleton

````markdown
# [Project Name]

[One paragraph: what it does and who it is for.]

## Quick Start

\```bash
cp .env.example .env
[package-manager] install
[run-command]
\```

## Configuration

| Variable | Required | Default | Description   |
| -------- | -------- | ------- | ------------- |
| `KEY`    | Yes      | -      | [Description] |

## Development

\```bash
[test-command]
[lint-command]
\```
````

## ADR Skeleton

ADR no longer has a separate skeleton here. For ADRs, load the
`architecture-decision` skill and use its `ADR_TEMPLATE.md` as the
official format.
