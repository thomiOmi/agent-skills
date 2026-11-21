# Baseline: `skill` and `subagent` tool use on `main`

This is a manual measurement procedure. No model is run by this repository; you run the
scenarios in your own OpenCode and paste the results back. Capture the **baseline** before
any changes to agents, skills, commands, plugins, instructions, or config. Then reuse the
exact same setup for the "after" run.

## Command verification status

Commands marked **executed** were run on this machine while preparing this document.
Commands marked **documented** were verified against `opencode --help` output and the official
CLI docs (<https://opencode.ai/docs/cli/commands/>) but were **not** executed against a real
session, because no model session was started.

| Command | Status |
|---|---|
| `opencode --version` | executed |
| `opencode debug paths` | executed |
| `opencode debug --help` | executed |
| `opencode debug config` | executed |
| `opencode session --help` | executed |
| `opencode session export --help` | executed |
| `opencode session list --format json` | executed |
| `opencode session export <sessionID> > file.json` | documented (help + official docs) |
| `opencode stats --tools --json` | documented (help + source) |
| `bun scripts/eval-count-tool-calls.ts <file.json>` | executed on the synthetic fixture in `tests/fixtures/` |
| `git rev-parse --short HEAD` | executed |

## Setup checklist

Record these values once, before starting scenario 1. Reuse all of them for the after run.

- [ ] OpenCode version: `opencode --version` -> **v2.3.2** (the version the counter script was verified against). Re-check the script after **any** OpenCode upgrade; the export shape and tool names can change.
- [ ] Model: write down the exact provider/model/variant used for every scenario (for example `provider/model`). Do not mix models across scenarios or between the baseline and after runs.
- [ ] Agent: start every scenario with the same primary agent (default agent here is `plan`; see config summary below). Note any manual agent switch in the notes column.
- [ ] Installed skills: **35** (count of `skills/*/SKILL.md` directories on this branch).
- [ ] Installed agents: **20** (count of `agents/*.md` on this branch).
- [ ] Config: run `opencode debug config` and summarize the sources. On this machine it reports the global `~/.config/opencode/opencode.jsonc` (`default_agent: plan`, `instructions: ["AGENTS.md"]`, `experimental.todo: true`, `experimental.subagent_depth: 2`, MCP servers configured) plus the project `opencode.jsonc` (`default_agent: plan`, `instructions: AGENTS.md, instructions/AGENTS.md, PRD.md, DECISIONS.md, ARCHITECTURE.md, SPEC.md, TASKS.md`). Headers and keys are printed as `***` by the command. Save the full output outside the repo if you need the exact source list.
- [ ] Commit SHA of `main` being measured: `git rev-parse --short HEAD` -> **0a9728e** (prepared against `main` at this SHA; confirm it is still current before you start, and record any change here: ______)
- [ ] Config and model for the after run are identical to the baseline. If either changes, the comparison is invalid.

## Measurement procedure

For each scenario, start a **fresh session** (one session per prompt), let the agent finish,
then record the session ID and count the calls.

```sh
# 1. Find the session ID (executed; prints JSON)
opencode session list --format json

# 2. Export that session as plain JSON (documented; NOT --sanitize, see below)
opencode session export <sessionID> > docs/eval/sessions/<scenario>-<sessionID>.json

# 3. Count tool calls (executed on the synthetic fixture)
bun scripts/eval-count-tool-calls.ts docs/eval/sessions/<scenario>-<sessionID>.json
```

Optional aggregate cross-check (documented; covers a time range/project, not one session,
and does not include skill/agent IDs):

```sh
opencode stats --tools --json
```

The counter prints totals for **every** tool name it sees, so a renamed `skill` or `subagent`
tool is visible. Skill IDs are read from `state.input.id`; subagent agent IDs from
`state.input.agent`. It reports error-state calls, ignores `streaming` string inputs under
"Incomplete", and cross-checks `type: "skill"` messages against `skill` tool calls. If it
prints `0 tool calls found in file` or `unexpected format`, treat that as a measurement
failure, not as a zero.

**Never use `--sanitize` for this measurement.** Source verification
(`packages/core/src/session/transfer.ts`, `sanitizeToolState` in anomalyco/opencode) shows it
replaces tool `state.input` with `{ redacted: "tool-input:<id>" }`, destroying the skill and
agent IDs. Runtime verification against a real session was **not** performed because no
model session was started and no synthetic session with tool calls existed on this machine;
the source finding is the basis for this instruction.

**Save exports only in `docs/eval/sessions/`.** That directory is gitignored. Exports contain
prompts, tool inputs, and possibly file contents. Never commit them, and do not share them
without redacting secrets.

## Scenarios

Each prompt below is a single copy-paste message. Skill IDs and agent IDs were checked
against `skills/*/SKILL.md` and `agents/*.md` on this branch. All expectations are
**expected, not required**: a correct run may use fewer, more, or different ones.

### 1. Feature development

> Add a `POST /api/widgets` endpoint that creates a widget from a validated name and returns 201. Implement it following this repo's existing conventions and add tests.

- Expected skills (expected, not required): `api-conventions`, `backend-patterns`, `testing`, `code-style`
- Expected subagents (expected, not required): `backend-developer`, `qa-engineer`

### 2. Bug investigation

> Users report that the installer silently skips updating a managed file. Investigate the root cause in `src/lib/install`, reproduce it, and report your findings. Do not change any files yet.

- Expected skills (expected, not required): `debugging`, `code-style`
- Expected subagents (expected, not required): `senior-developer`, `backend-developer`

### 3. Refactoring

> Refactor `src/lib/install/config-merge.ts` to reduce duplication without changing behavior. Keep the existing tests passing.

- Expected skills (expected, not required): `refactor-planner`, `code-simplifier`, `code-style`, `testing`
- Expected subagents (expected, not required): `refactor-planner`, `senior-developer`

### 4. Git commit request

> Stage all current changes and propose a Conventional Commit message for them. Do not push and do not create a commit.

- Expected skills (expected, not required): `git-workflow`
- Expected subagents (expected, not required): none

### 5. Doc-writing request

> Update the install section of `README.md` so it clearly explains the merge, replace, and symlink install modes. Keep the tone plain and direct.

- Expected skills (expected, not required): `documentation`, `no-ai-slop`
- Expected subagents (expected, not required): `docs-writer`

### 6. DB schema change

> Add a `widgets` table with `id`, `name`, and `created_at`, plus a migration. Update the schema documentation and tests.

- Expected skills (expected, not required): `database`, `database-migration`
- Expected subagents (expected, not required): `database-engineer`

### 7. Frontend UI change

> Add a loading state and an empty state to the settings panel component, following this project's UI conventions.

- Expected skills (expected, not required): `ui-design`, `frontend-patterns`
- Expected subagents (expected, not required): `frontend-developer`, `ui-ux`

### 8. Security review

> Review the installer's path containment checks for security vulnerabilities and report findings only. Do not change any files.

- Expected skills (expected, not required): `security-review`
- Expected subagents (expected, not required): `security-auditor`

### 9. Test-writing request

> Write unit tests for the config merge function covering arrays, unknown keys, invalid JSONC, and missing files.

- Expected skills (expected, not required): `testing`, `test-planning`
- Expected subagents (expected, not required): `qa-engineer`

### 10. Trivial one-line edit (control)

> Fix the typo in the README heading: change "Instal" to "Install".

- Expected skills (expected, not required): none
- Expected subagents (expected, not required): none

## Results table template

Paste one row per scenario. `skill calls` and `subagent calls` list the IDs printed by the
counter; write `none` when the counter printed `(none)`. A wrong agent ID shows up as an
error-state `subagent` call with the guessed `agent` value in `state.input`.

| Scenario | Session ID | Skill calls (IDs) | Subagent calls (IDs) | Wrong agent ID guessed (error)? | Notes |
|---|---|---|---|---|---|
| 1 Feature development | | | | | |
| 2 Bug investigation | | | | | |
| 3 Refactoring | | | | | |
| 4 Git commit request | | | | | |
| 5 Doc-writing request | | | | | |
| 6 DB schema change | | | | | |
| 7 Frontend UI change | | | | | |
| 8 Security review | | | | | |
| 9 Test-writing request | | | | | |
| 10 Trivial edit (control) | | | | | |

Notes should include model and agent used, any manual intervention, whether the session
compacted, and any `unexpected format` / `0 tool calls found in file` result.
