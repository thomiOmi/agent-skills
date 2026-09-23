
# CI/CD Pipeline Design

Guidelines for designing fast, deterministic, and secure CI/CD workflows.

---

## Pipeline Stages

```text
Trigger (push/PR) -> Lint & Format -> Typecheck -> Test -> Build Artifact -> Deploy
```

1. **Fail Fast**: Run fast checks (lint, typecheck) first before slow tests or builds.
2. **Caching**: Cache dependency folders (`node_modules`, `bun cache`, `~/.cache`) using content hashes.
3. **Artifact Immutability**: Build release artifacts once, then deploy the same binary/container across environments.
4. **Secrets Security**: Pass credentials via encrypted secrets managers (`secrets.GITHUB_TOKEN`), never plain text.

---

## Verification Checklist

```markdown
- [ ] Pipeline triggers on push to main and pull requests
- [ ] Fast checks (lint, typecheck) gate slower test stages
- [ ] Dependencies cached using lockfile hashes
- [ ] Secrets retrieved from secret store, never hardcoded
- [ ] Deployment stage depends on 100% passing tests
```
