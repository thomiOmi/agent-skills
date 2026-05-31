# Changelog Format

Format: [Keep a Changelog](https://keepachangelog.com).
Update on every PR that changes behavior.

```markdown
## [Unreleased]

### Added
- User export endpoint: `GET /users/{id}/export`

### Changed
- `calculateRetryDelay` now caps at 30 s (was 60 s)

### Fixed
- Pagination cursor was off-by-one for empty result sets

### Deprecated
- `POST /v1/users/create` — use `POST /v2/users` instead

### Removed
- `legacyAuth` middleware (deprecated in v1.2)

### Security
- Upgraded `jsonwebtoken` to address CVE-2024-XXXXX
```

Valid sections: `Added` · `Changed` · `Fixed` · `Deprecated` · `Removed` · `Security`
