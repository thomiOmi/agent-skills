---
name: docker-container
description: 'Use this skill when writing Dockerfiles, docker-compose configs, or containerizing applications. Trigger with "write Dockerfile", "docker-compose", "containerize", "Docker multi-stage", "container security", or when configuring container images. Do not write container configs without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Docker & Containerization

Guidelines for writing secure, small, and deterministic container images.

---

## Multi-Stage Dockerfile Pattern

```dockerfile
# Stage 1: Build dependencies & code
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Stage 2: Minimal runtime image
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app ./
USER appuser
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

---

## Verification Checklist

```markdown
- [ ] Base image pinned to specific version (no `:latest`)
- [ ] Multi-stage build used for minimal final image
- [ ] Non-root user created and activated (`USER appuser`)
- [ ] `.dockerignore` excludes `node_modules`, `.git`, `.env`
- [ ] No hardcoded secrets in Dockerfile or build arguments
- [ ] `HEALTHCHECK` instruction included
```
