# README Structure

Every project needs a README that answers these in order:

```
1. What is this?    — One paragraph. What it does and who it's for.
2. Quick start      — Minimum steps to run it. Must work copy-paste.
3. Usage            — Common use cases with real examples.
4. Configuration    — All env vars and config options, with defaults.
5. Development      — How to run tests, linter, and contribute.
6. Architecture     — (optional) High-level overview for contributors.
```

## Quick start must be copy-pasteable

```bash
# Bad
npm install && npm start

# Good
cp .env.example .env   # fill in your API keys
npm install
npm run dev            # → http://localhost:3000
```

## Document the unexpected, not the obvious

```markdown
# Bad
Run npm install to install dependencies.

# Good
Requires Node 22+. Uses pnpm workspaces — run `pnpm install` from the
repo root, not from individual packages.
```
