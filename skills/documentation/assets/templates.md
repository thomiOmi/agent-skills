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

ADR tidak lagi memiliki skeleton terpisah di sini. Untuk ADR, load skill
`architecture-decision` dan gunakan template `ADR_TEMPLATE.md` milik skill
tersebut sebagai format resmi.
