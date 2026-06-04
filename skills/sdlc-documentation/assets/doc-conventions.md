# Document Storage Conventions

```text
docs/
├── prd/
│   └── YYYY-MM-feature-name.md
├── sdd/
│   └── YYYY-MM-feature-name.md
├── adr/
│   └── NNN-decision-title.md
├── test-plans/
│   └── YYYY-MM-feature-name.md
└── release-notes/
    └── vX.Y.Z.md
```

## Naming Rules

- Use kebab-case for file names
- Prefix with date (YYYY-MM) for chronological sorting
- ADRs use sequential numbers (001, 002, ...)
- Release notes use semantic version (v1.2.3)
