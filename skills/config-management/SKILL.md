---
name: config-management
description: 'Use this skill whenever you create or modify project configuration files: package manifests (package.json, pyproject.toml, Cargo.toml, go.mod), tsconfig or compiler settings, linter and formatter configs, CI pipeline files, Docker or compose files, .env.example, and tool config such as opencode.jsonc. Covers safe editing of format-sensitive files, keeping .env.example in sync with code, keeping secrets out of committed config, validating after changes, and confirming with the user before dependency, schema, or pipeline changes. Scope is project configuration files only - application code goes to code-style, infrastructure provisioning and deployment go to devops. Triggers include: "update package.json", "edit tsconfig", "change the eslint config", "add a dependency", "update .env.example", "modify the CI config", "change docker-compose", "update opencode.jsonc", "bump the version field", "add a script entry", "is this config correct".'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Config Management

Conventions for safely creating and modifying project configuration
files. Config has no test coverage of its own - a wrong change surfaces
later as broken builds, broken CI, or leaked secrets.

---

## Scope Boundary

This skill covers project configuration files only.

- Application code conventions: load `code-style` instead.
- CI pipeline design, deployment, and infrastructure: load
  `devops-deployment` instead.
- Database schema and migrations: load `database` instead.

If a change touches config plus one of those areas, apply both skills
but keep each concern in its own commit or clearly separated change.

---

## Core Rules

**Read before write:**

- Read the full config file before editing any part of it.
  - Why: Many config formats are structure-sensitive (JSONC comments, indentation, key order conventions). Partial edits based on a fragment silently corrupt parseability or break tooling assumptions.

**One concern per change:**

- One logical config change per commit, message explains why.
  - Why: Config has no tests as a safety net. When a build breaks after a config change, small isolated commits are the only practical way to bisect the cause.

**Keep documentation in sync:**

- When a change adds, removes, or renames a setting, env var, or script, update the related docs (.env.example, README setup section) in the same change.
  - Why: Stale config docs are worse than none - they direct the next setup attempt into errors that look like bugs in the project itself.

**Secrets never in committed config:**

- .env.example contains placeholder values only, never real credentials.
  - Why: Committed secrets are effectively permanent; rotation is costly and history rewrite is disruptive. Placeholders communicate shape without leaking value.
- Environment differences (dev, staging, prod) go through env vars or override files, not duplicated config files.
  - Why: Duplicated files drift apart silently, and the drift is discovered only in the environment where it fails.

**Confirm before structural changes:**

- Ask the user before: adding a dependency, changing a schema or migration config, modifying CI pipeline config, or restructuring config files.
  - Why: These changes alter the project contract for everyone and can affect cost, security posture, or CI behavior. Project AGENTS.md "ask first" rules typically list exactly these categories.

**Validate after every change:**

- Run the checks the config affects before declaring done: typecheck, lint, test, or at minimum a successful build or dry-run.
  - Why: Config changes have wide blast radius - a tsconfig edit affects compilation, linting, and CI simultaneously. Verification is the only guard config has.

---

## Checklist

```markdown
- [ ] Read the full config file before editing
- [ ] One logical config change per commit, message explains why
- [ ] Related docs (.env.example, README setup) updated in the same change
- [ ] No real secrets in committed config; placeholders in .env.example
- [ ] Environment differences via env vars or overrides, not duplicated files
- [ ] User confirmed dependency, schema, CI, or structural changes
- [ ] Post-change validation run (typecheck, lint, test, or build)
```
