# Baseline: `skill` and `subagent` tool use (playground)

This is a manual measurement procedure. No model is run by this repository. The user runs the
scenarios in their own OpenCode against a throwaway playground project, then pastes the results
back. Capture the **baseline** before changing any agents, skills, commands, plugins,
instructions, or config. Later, repeat with the identical setup for the after run.

The target is `<playground>`, the `agent-playground` sibling of this repository; substitute your
local path when running. See [`playground.md`](playground.md) for its contents and seeded issues.
The playground has no
project config, so the **global installed config** is what gets measured, not this repo's
`opencode.jsonc`.

## Command verification status

**executed** means the command was run while preparing this document. **documented** means it
was checked against `opencode --help` and the official CLI docs
(<https://opencode.ai/docs/cli/commands/>) but not run against a real session, because no model
session was started.

| Command | Where | Status |
|---|---|---|
| `opencode --version` | repo | executed (v2.3.2) |
| `opencode debug paths` | repo | executed |
| `opencode debug agents` | repo | executed |
| `opencode debug --help` | repo | executed |
| `opencode debug config` | playground | executed |
| `opencode session --help` | repo | executed |
| `opencode session export --help` | repo | executed |
| `opencode session list --format json` | repo | executed |
| `bun test` | playground | executed (4 passed) |
| `git reset --hard HEAD` + `git clean -fd` | playground | executed |
| `git rev-parse --short HEAD` | both repos | executed |
| `bun scripts/eval-count-tool-calls.ts <file.json>` | repo | executed on the synthetic fixture |
| `opencode session export <sessionID> > file.json` | playground | documented (help + official docs) |
| `opencode stats --tools --json` | playground | documented (help + source) |

## Setup checklist

Record these once before run 1. Reuse all of them for run 2 and for the after run.

- [ ] OpenCode version: `opencode --version` -> **v2.3.2**, the version the counter script was verified against. Re-check the script after **any** OpenCode upgrade; the export shape and tool names can change.
- [ ] Model: write down the exact provider/model/variant. Do not change it between runs.
- [ ] Primary agent: use the agent listed per scenario below (`build` or `plan`). Note any manual switch in the Notes column.
- [ ] Playground path: `<playground>` (the sibling `agent-playground` directory), clean commit `99419d2`. Confirm `bun test` passes (4 tests) before starting.
- [ ] Playground has no `opencode.jsonc`, `AGENTS.md`, `.opencode/`, or `.agents/`. Do not add any of them.
- [ ] Installed skills count **from the global install** (not this repo): `<HOME>/.config/opencode/skills/` contains **43** skill directories, and the ownership manifest `<HOME>/.config/opencode/.agent-skills-manifest.json` exists. Re-read the count at run time.
- [ ] Installed agents count **from the global install**: `opencode debug agents` reports **27** agents total: 20 installed subagents plus 7 built-ins (`build`, `compaction`, `explore`, `general`, `plan`, `summary`, `title`). The installed `agents/` directory contains **20** files. Re-read at run time.
- [ ] Difference from this repo: `agent-skills` currently has **35** skills and **20** agents. The global install has 43 skills (8 extra local skills) and the same 20 agents. Use the global numbers as the setup record.
- [ ] Config source: run `opencode debug config` **from the playground directory** and summarize it locally; do not paste its raw output here. It reports a single global config document under `<HOME>/.config/opencode/` and no project or ancestor config. Relevant keys are `default_agent`, `instructions`, `experimental.todo` (enabled), `experimental.subagent_depth` (set), plus MCP server entries; sensitive values are redacted by the command.
- [ ] Repo commit being measured: record `git rev-parse --short HEAD` from `agent-skills` at run time.
- [ ] The model, global config, and installed agent/skill set are identical for the baseline and after runs. If any changes, the comparison is invalid.

## Reset and measurement procedure

Do this before **every** run, including both runs of the same scenario. Scenario 4 has one extra
manual step described there.

```sh
# 1. Reset the playground to the clean commit (executed; destructive only inside the playground)
cd ../agent-playground
git reset --hard HEAD
git clean -fd
bun test

# 2. Start a fresh OpenCode session from the playground directory, send exactly one prompt, let it finish.

# 3. Find the session ID (executed)
opencode session list --format json

# 4. Export that session as plain JSON (documented; NOT --sanitize, see below)
opencode session export <sessionID> > docs/eval/sessions/<scenario>-run<N>-<sessionID>.json
```

Note: the export path above is relative to this repo. Create `docs/eval/sessions/` first if it
does not exist; it is gitignored.

```sh
# 5. Count tool calls (executed on the synthetic fixture in tests/fixtures/)
cd ../agent-skills
bun scripts/eval-count-tool-calls.ts docs/eval/sessions/<scenario>-run<N>-<sessionID>.json
```

Optional aggregate cross-check (documented; time-range/project totals only, no per-session
breakdown and no skill/agent IDs):

```sh
opencode stats --tools --json
```

The counter prints totals for **every** tool name it sees, so a renamed `skill` or `subagent`
tool is visible. Skill IDs come from `state.input.id`; subagent agent IDs from
`state.input.agent`. **Failed IDs** in the results table are the IDs reported on error-state
tool entries, for example a guessed agent ID that does not exist. Streaming string inputs are
ignored and listed under "Incomplete". If the counter prints `0 tool calls found in file` or
`unexpected format`, record that as a measurement failure, not as a zero.

Subagent calls create **child sessions** with a `parentID`. The export of the main session does
not contain their internal tool calls. Find children with `opencode session list --format json`,
export each child into `docs/eval/sessions/`, run the counter on each, and record whether you did
so in the "Child sessions exported?" column. Use `no` only when there were no children.

**Never use `--sanitize` for this measurement.** Source verification
(`packages/core/src/session/transfer.ts`, `sanitizeToolState` in anomalyco/opencode) shows it
replaces tool `state.input` with `{ redacted: "tool-input:<id>" }`, destroying the skill and
agent IDs. Runtime verification was not possible because no model session was started and no
synthetic session with tool calls existed; the source finding is the basis for this instruction.
Exports contain prompts and tool inputs, so keep them local and never commit them.

## Scenarios

Send exactly one prompt per fresh session. Skill and agent IDs were checked against
`skills/*/SKILL.md` and `agents/*.md` in this repo. All expectations are **expected, not
required**: a correct run may use fewer, more, or different ones. The prompts describe goals or
symptoms only; they never reveal the seeded defects.

| # | Primary agent | Prompt (copy-paste exactly) | Expected skills (expected, not required) | Expected agents (expected, not required) |
|---|---|---|---|---|
| 1 Feature (larger, multi-file) | build | Add POST /widgets with validated name, insert into SQLite, return 201, add tests, and document the endpoint in the README. | `api-conventions`, `backend-patterns`, `database`, `documentation`, `testing`, `code-style` | `backend-developer`, `database-engineer`, `docs-writer`, `qa-engineer` |
| 2 Bug investigation | plan | GET /widgets?limit=N returns one more item than N. Find the root cause and report. Do not change files. | `debugging` | `senior-developer`, `deep-thinker` |
| 3 Refactor | build | Remove the duplicated validation logic between the handlers without changing behavior; keep tests passing. | `refactor-planner`, `code-simplifier`, `code-style`, `testing` | `refactor-planner`, `senior-developer` |
| 4 Git commit | build | Stage all current changes and commit them with a Conventional Commit message. Do not push. | `git-workflow` | none |
| 5 Docs | build | Update the README so the run and test sections are accurate and clear. | `documentation`, `no-ai-slop` | `docs-writer` |
| 6 DB schema | build | Add a `tags` table linked to widgets with a migration, update the schema docs and tests. | `database`, `database-migration` | `database-engineer` |
| 7 Frontend | build | Add a loading state and an empty state to the WidgetList component. | `ui-design`, `frontend-patterns` | `frontend-developer`, `ui-ux` |
| 8 Security review | plan | Review the API and database code for security vulnerabilities. Report findings only; do not change files. | `security-review` | `security-auditor` |
| 9 Tests | build | Write unit tests for the widget validation function covering valid input, empty name, too-long name, and non-string name. | `testing`, `test-planning` | `qa-engineer` |
| 10 Trivial control | build | Fix the typo in the README heading. | none (expected, not required) | none (expected, not required) |

Scenario 4 precondition: after the reset and before starting the session, append one arbitrary
line to the playground README so there is an uncommitted change to commit.

## Results table template

Run every scenario at least twice (Run 1 and Run 2) in separate fresh sessions. Write `none`
when the counter printed `(none)`. Failed IDs and child-session status come from the counter
and from `opencode session list --format json`.

| Scenario | Run (1/2) | Primary agent (build/plan) | Session ID | Skill calls (IDs) | Subagent calls (IDs) | Failed IDs | Child sessions exported? | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 Feature | 1 | build | | | | | | |
| 1 Feature | 2 | build | | | | | | |
| 2 Bug investigation | 1 | plan | | | | | | |
| 2 Bug investigation | 2 | plan | | | | | | |
| 3 Refactor | 1 | build | | | | | | |
| 3 Refactor | 2 | build | | | | | | |
| 4 Git commit | 1 | build | | | | | | |
| 4 Git commit | 2 | build | | | | | | |
| 5 Docs | 1 | build | | | | | | |
| 5 Docs | 2 | build | | | | | | |
| 6 DB schema | 1 | build | | | | | | |
| 6 DB schema | 2 | build | | | | | | |
| 7 Frontend | 1 | build | | | | | | |
| 7 Frontend | 2 | build | | | | | | |
| 8 Security review | 1 | plan | | | | | | |
| 8 Security review | 2 | plan | | | | | | |
| 9 Tests | 1 | build | | | | | | |
| 9 Tests | 2 | build | | | | | | |
| 10 Trivial control | 1 | build | | | | | | |
| 10 Trivial control | 2 | build | | | | | | |

Notes should include model, any manual intervention, whether the session compacted, and any
`unexpected format` / `0 tool calls found in file` result.
