# Docker

Best practices for building secure, efficient, and reproducible container images.

---

## Image Structure

```dockerfile
# 1. Pin base image to exact version — never :latest
FROM node:20.18.0-alpine@sha256:abc123 AS builder

# 2. Install dependencies first (leverage cache)
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 3. Copy source after dependencies
COPY . .

# 4. Build in builder stage
RUN npm run build

# 5. Final stage — minimal runtime image
FROM node:20.18.0-alpine@sha256:abc123
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

---

## Best Practices

### Base Images

- Pin to a specific digest (`@sha256:...`) or at minimum a minor version
- Use distroless or Alpine for smaller attack surface
- Prefer official images from trusted registries

### Layering

- Order layers by frequency of change (least → most)
  - OS packages → runtime → dependencies → code
- Combine `RUN` commands when they produce related files
- Use `.dockerignore` to exclude unnecessary files

### Security

- Never run as root — create a non-root user
- Never bake secrets into images — use build args or secrets mounts
- Scan images for vulnerabilities (`docker scan`, Trivy, Snyk)
- Remove package manager cache and temp files in same layer

### Performance

- Use multi-stage builds to keep final image small
- Leverage build cache by separating dependency install from code copy
- Set `NODE_ENV=production` to skip dev dependencies

---

## Dockerfile Checklist

```
- [ ] Base image pinned to specific version (not :latest or :alpine without tag)
- [ ] Multi-stage build used (builder → runtime)
- [ ] .dockerignore exists and excludes node_modules, .git, dist
- [ ] Non-root user created and used
- [ ] Secrets not baked into image (use ARG with --mount=type=secret)
- [ ] HEALTHCHECK configured
- [ ] Ports documented with EXPOSE
- [ ] Resource limits set in compose or k8s manifest
- [ ] Container logs to stdout/stderr (not files)
- [ ] ReadOnlyRootFilesystem where applicable
```

---

## Common Anti-Patterns

| Pattern | Problem | Fix |
| ------- | ------- | --- |
| `:latest` tag | Non-deterministic builds | Pin to specific version |
| Single stage image | Includes build tools in production | Use multi-stage builds |
| `COPY . /app` | Breaks cache on every change | Copy deps first, then code |
| Root user | Container can modify host mounts | Create and use non-root user |
| Secrets in ENV | Visible in image history | Use build secrets or runtime env |
| No health check | Orchestrator cannot detect failures | Add HEALTHCHECK instruction |
