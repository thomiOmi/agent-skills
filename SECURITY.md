# Security Policy

## Supported versions

Security fixes are considered for the latest version on the `main` branch and
the latest published package release. Older versions may not receive fixes.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting or a private security advisory for
this repository when available. If that channel is unavailable, contact the
repository maintainer privately through the maintainer's GitHub profile and
include the repository name in the message.

Please include:

- a concise description of the vulnerability;
- affected files, versions, or commit ranges;
- reproducible steps or a minimal proof of concept;
- the expected and observed behavior;
- the potential impact; and
- any suggested mitigation.

Remove credentials, tokens, personal data, and other sensitive values from the
report. If a secret was exposed, rotate it immediately and report the
exposure privately.

## Response and disclosure

The maintainer will acknowledge reports when practical, investigate the
reported impact, and coordinate a fix or mitigation with the reporter.
Response and remediation time may vary with severity and maintainer
availability; this project does not promise a fixed response-time SLA.

Please allow time for a fix before public disclosure. The maintainer may
request a coordinated disclosure date after a mitigation is available.

## Scope

Reports may concern:

- installer path or configuration handling;
- plugin hooks and custom tools;
- secret detection or destructive-command guards;
- package contents or release artifacts;
- dependency vulnerabilities introduced by this project; and
- documentation or examples that cause unsafe behavior.

The guards in `plugin/` are safety layers, not a replacement for operating
system permissions, OpenCode permissions, or secure deployment practices.

## Out of scope

Reports about vulnerabilities in OpenCode, Bun, GitHub, or other upstream
systems should be reported to their respective maintainers unless this
repository introduces a specific unsafe integration.

