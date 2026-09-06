---
name: devops-deployment
description: 'Use this skill when setting up, configuring, or managing CI/CD pipelines, deployment infrastructure, containers, cloud services, or monitoring. Load this skill proactively before writing any deployment config, Dockerfile, CI workflow, or infrastructure code. Do not write deployment or infrastructure code without this skill loaded. Triggers include: "set up CI/CD", "deploy to production", "write a Dockerfile", "Kubernetes config", "infrastructure review", "monitoring setup", "rollback plan", "cloud architecture", "deployment", "pipeline", "continuous integration", "continuous deployment", "staging", "production", "environment", "secrets management", "Docker", "container", "orchestration", "K8s", "helm", "Terraform", "Pulumi", "AWS", "GCP", "Azure", "Vercel", "Netlify", "nginx config", "reverse proxy", "load balancer", "auto-scaling", "blue-green", "canary", "health endpoint", "readiness probe", "liveness probe", "SRE", "observability", "metrics", "alerts". Covers major cloud providers and PaaS platforms.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# DevOps & Deployment

Guidelines for reliable, secure, and maintainable infrastructure and deployment pipelines.

---

## References

- `references/docker.md` - multi-stage builds, security scanning, registry management

See `assets/templates.md` for Dockerfile, pipeline, and deployment workflow templates.
For CI/CD pipeline patterns, load the `ci-cd-pipeline` skill.

---

## Examples

**Dockerfile before (single stage, :latest, root user):**

```dockerfile
FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

**Dockerfile after (multi-stage, pinned, non-root):**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app ./
USER appuser
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

---

## CI/CD Principles

1. **Fail fast** - validate lint, typecheck, tests before building
2. **Deterministic builds** - same commit always produces same artifact
3. **Immutable artifacts** - build once, promote through environments
4. **Idempotent deployments** - running the same deploy twice is safe
5. **Rollback always** - every deployment has a tested rollback plan

---

## CI/CD Pipeline Structure

```text
Trigger (push/PR) to Lint to Typecheck to Test to Build to Stage to Production

Each stage gates the next. If any stage fails, the pipeline stops.
```

---

## Docker Checklist

```markdown
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

```markdown
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

```markdown
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

- Never hardcode secrets - use environment variables or secret managers
  - Why: Secrets in source code end up in Git history, CI logs, and artifact storage - all of which lack access controls and rotation policies. A single leaked secret can compromise production.
- Never use :latest tag in production - always pin versions
  - Why: `:latest` changes without notice. A deployment that works today may pull a subtly different image tomorrow. Pinning to a specific digest or version ensures deterministic builds.
- Never deploy without a rollback plan
  - Why: Deployments fail - schema mismatches, config errors, traffic spikes. Without a tested rollback plan, a bad deployment becomes a production incident measured in hours, not minutes.
- Never make manual changes to production infrastructure
  - Why: Manual changes are unreproducible, undocumented, and lost when the instance is replaced. They create "snowflake" infrastructure that drifts from IaC and breaks automation.
- Always test rollback procedure before depending on it
  - Why: An untested rollback is worse than no rollback - you discover during an incident that the migration is irreversible, the old artifact is gone, or the data format has changed.
