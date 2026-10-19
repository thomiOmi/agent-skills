# Contributing

Thank you for contributing to agent-skills. Contributions may add or improve
skills, agents, slash commands, tools, plugins, installer behavior, or
documentation.

## Before you start

- Read [AGENTS.md](./AGENTS.md) for repository rules and source-of-truth
  ownership.
- Check [TASKS.md](./TASKS.md) and existing issues or pull requests before
  starting work.
- For security vulnerabilities, follow [SECURITY.md](./SECURITY.md) instead
  of opening a public issue.

## Development setup

The project uses Bun. Install dependencies and enable the repository hooks:

```bash
bun install
bunx simple-git-hooks
```

Run the relevant checks before opening a pull request:

```bash
bun run lint --format json
bun run typecheck
bun test tests/
```

Do not run `npm publish` locally. Release preparation uses the project
release scripts and is performed by maintainers.

## Making changes

1. Create a descriptive branch from `main`.
2. Read the relevant source-of-truth documents before editing.
3. Keep each commit focused and use Conventional Commits.
4. Update directly related documentation and tests.
5. Run the required checks locally.
6. Open a pull request using the repository template.

Do not edit installed files under `~/.config/opencode/` directly. Update the
repository sources and use the installer when testing deployment behavior.

## Adding repository components

- Skills belong under `skills/<skill-name>/SKILL.md` and must follow
  [SPEC.md](./SPEC.md).
- Agents belong under `agents/` and must be reflected in the canonical roster
  in [AGENTS.md](./AGENTS.md).
- Slash commands belong under `commands/`.
- Installer sources must remain included in `package.json` and covered by the
  package manifest test.
- OpenCode-specific behavior belongs in the integration layer. Keep skill
  content portable across agent runtimes.

## Pull requests

Pull requests should explain the problem, the proposed change, affected
surfaces, and validation performed. Include documentation and security impact
in the description when relevant.

Keep pull requests small enough to review. Do not include unrelated formatting
changes, generated artifacts, secrets, credentials, or personal data.

Maintainers may request changes, squash commits, or close work that is out of
scope or duplicates an existing effort.

