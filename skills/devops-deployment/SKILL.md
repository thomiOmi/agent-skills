---
name: devops-deployment
description: Use this skill when designing or managing CI/CD pipelines, deployment, infrastructure, Docker, Kubernetes, or cloud services. Triggers: "set up CI/CD", "deploy to production", "write a Dockerfile", "Kubernetes config", "infrastructure review", "monitoring setup", "rollback plan", "cloud architecture". Use before writing any infrastructure or pipeline code.
license: MIT
compatibility: OpenCode and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# DevOps & Deployment

Guidelines for reliable, secure, and maintainable infrastructure and deployment pipelines.

---

## CI/CD Principles

1. **Fail fast** — validate lint, typecheck, tests before building
2. **Deterministic builds** — same commit always produces same artifact
3. **Immutable artifacts** — build once, promote through environments
4. **Idempotent deployments** — running the same deploy twice is safe
5. **Rollback always** — every deployment has a tested rollback plan

---

## CI/CD Pipeline Structure

```
Trigger (push/PR) → Lint → Typecheck → Test → Build → Stage → Production

Each stage gates the next. If any stage fails, the pipeline stops.
```

---

## Docker Checklist

```
- [ ] Base image is pinned to a specific version (not :latest)
- [ ] Multi-stage build for smaller images
- [ ] .dockerignore excludes node_modules, .git, dist
- [ ] No secrets baked into the image
- [ ] Container runs as non-root user
- [ ] Health check configured
- [ ] Resource limits set (CPU, memory)
- [ ] Logs to stdout/stderr (not files)
```

---

## Deployment Checklist

```
- [ ] Database migrations are reversible
- [ ] Zero-downtime deployment strategy defined
- [ ] Health check endpoint responds before traffic is routed
- [ ] Monitoring alerts configured for key metrics
- [ ] Rollback plan documented and tested
- [ ] Secrets managed via secret store (not env files in repo)
- [ ] Feature flags for risky changes
- [ ] Canary or percentage-based rollout for major changes
```

---

## Infrastructure Principles

- Everything is declarative and version-controlled (IaC)
- No manual changes to production infrastructure
- Least-privilege access for all service accounts
- Network segmentation (private subnets for databases)
- Encryption in transit and at rest by default

---

## Monitoring Checklist

```
- [ ] Application health endpoint monitored
- [ ] Error rate alerts configured
- [ ] Latency p50/p95/p99 tracked
- [ ] Resource utilization monitored (CPU, memory, disk, network)
- [ ] Log aggregation and search configured
- [ ] Uptime monitoring with external checks
- [ ] On-call rotation and incident response defined
```

---

## Hard Rules

- Never hardcode secrets — use environment variables or secret managers
- Never use :latest tag in production — always pin versions
- Never deploy without a rollback plan
- Never make manual changes to production infrastructure
- Always test rollback procedure before depending on it
