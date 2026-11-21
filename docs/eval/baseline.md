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
| `opencode api get /api/skill` | playground | executed (60 advertised, 28806 description chars) |
| `opencode session --help` | repo | executed |
| `opencode session export --help` | repo | executed |
| `opencode session list --format json` | repo | executed |
| `bun test` | playground | executed (4 passed) |
| `git reset --hard HEAD` + `git clean -fd` | playground | executed |
| `git rev-parse --short HEAD` | both repos | executed |
| `bun scripts/eval-count-tool-calls.ts <file.json>` | repo | executed on the synthetic fixture and a real export |
| `bun scripts/eval-collect.ts ...` | repo | executed in tests with a fake runner and synthetic fixtures; not run against real OpenCode |
| `bun scripts/eval-report.ts ...` | repo | executed in tests with synthetic summaries |
| `opencode session export <sessionID> > file.json` | repo | executed on a real session (plain, no `--sanitize`) |
| `opencode stats --tools --json` | playground | documented (help + source) |

## Setup checklist

Record these once before run 1. Reuse all of them for run 2 and for the after run.

- [ ] OpenCode version: `opencode --version` -> **v2.3.2**, the version the counter script was verified against. Re-check the script after **any** OpenCode upgrade; the export shape and tool names can change.
- [ ] Model: write down the exact provider/model/variant. Do not change it between runs.
- [ ] Primary agent: use the agent listed per scenario below (`build` or `plan`). Note any manual switch in the Notes column.
- [ ] Playground path: `<playground>` (the sibling `agent-playground` directory), clean commit `99419d2`. Confirm `bun test` passes (4 tests) before starting.
- [ ] Playground has no `opencode.jsonc`, `AGENTS.md`, `.opencode/`, or `.agents/`. Do not add any of them.
- [ ] Advertised skills: run `opencode api get /api/skill` **from the playground directory** and count the advertised IDs. Current baseline: **60** (57 filesystem + 3 built-ins). Per-source counts: global OpenCode skills folder **43**, `<HOME>/.agents/skills` **15**, `<HOME>/.claude/skills` **9**, duplicate IDs **10**, built-ins **3**. This includes **8** skills not owned by this repo; they are part of the measured environment. Duplicate IDs resolve by the documented source precedence at <https://opencode.ai/docs/skills/#precedence>: **9** resolve to the home `.agents/skills` source and **1** to the global OpenCode folder. Re-read at run time. Record counts per source only; never paste the full ID list into a tracked file.
- [ ] Advertised description size: from the same API output, sum the character lengths of every advertised `description`. Current baseline: **28806** characters. Recompute at run time.
- [ ] Save the full sorted advertised ID list locally in `docs/eval/sessions/advertised-skill-ids.txt` (gitignored, never committed). For the after run the list must be identical, except for repo-owned skills that the planned changes add, rename, or remove.
- [ ] Installed agents count **from the global install**: `opencode debug agents` reports **27** agents total: 20 installed subagents plus 7 built-ins (`build`, `compaction`, `explore`, `general`, `plan`, `summary`, `title`). The installed `agents/` directory contains **20** files. Re-read at run time.
- [ ] Config source: run `opencode debug config` **from the playground directory** and summarize it locally; do not paste its raw output here. It reports a single global config document under `<HOME>/.config/opencode/` and no project or ancestor config. Relevant keys are `default_agent`, `instructions`, `experimental.todo` (enabled), `experimental.subagent_depth` (set), plus MCP server entries; sensitive values are redacted by the command.
- [ ] Repo commit being measured: record `git rev-parse --short HEAD` from `agent-skills` at run time.
- [ ] The model, global config, and installed agent/skill set are identical for the baseline and after runs. If any changes, the comparison is invalid.

The advertised counts, description total, and local ID list were produced by these commands, run
from the playground directory:

```powershell
$j = opencode api get /api/skill | ConvertFrom-Json
$ids = @($j.data.id | Sort-Object)
$ids | Set-Content ../agent-skills/docs/eval/sessions/advertised-skill-ids.txt
$chars = 0; foreach ($item in $j.data) { $chars += $item.description.Length }; $chars
```

## Reset and measurement procedure

Do this before **every** run, including both runs of the same scenario. Scenario 4 has one extra
manual step described there.

```sh
# 1. Reset the playground to the clean commit (executed; destructive only inside the playground)
cd <playground-dir>
git reset --hard HEAD
git clean -fd
bun test

# 2. Start a fresh OpenCode session from the playground directory, send exactly one prompt, let it finish.
```

### Automated collection

From this repo, run the collector for each scenario/run. Provide the playground directory with
`--playground <dir>` or the `EVAL_PLAYGROUND_DIR` environment variable:

```sh
bun scripts/eval-collect.ts <scenario> <run> --playground <playground-dir>
```

It selects the newest root session whose `directory` field matches the playground, refuses
sessions older than 60 minutes or already collected (`--force` overrides), exports the session
and its descendants into `docs/eval/sessions/` (gitignored), writes one summary per collection to
`docs/eval/sessions/summary/<scenario>-run<N>.json`, and prints the Markdown row for the results
table. If the exported `info.parentID` is present, the selected session is a child and collection
fails without writing a summary. The summary records `childCoverage`: when completed `subagent`
calls outnumber exported children, the collector writes a loud stderr warning, sets
`childCoverage` to `incomplete`, and the report flags that scenario. A `0 tool calls found in file`
result is a **valid zero**: it is recorded in `zeroToolSessions` with `main`/`child` provenance and
shown as `zeroToolCalls=<n>` in the row notes; it is not a measurement failure.
`--session <id>` selects a specific session instead of the newest match (directory matching and the
60-minute freshness rule are skipped, with a printed note); it is the recovery path when the newest
session is a child. The `info.parentID` guard still applies. Never use `--sanitize`.

### Reporting

```sh
bun scripts/eval-report.ts docs/eval/sessions/summary
bun scripts/eval-report.ts docs/eval/sessions/summary --json docs/eval/sessions/metrics.json
bun scripts/eval-report.ts docs/eval/sessions/summary --compare <before.json> <after.json>
```

The report prints the full results table plus ID-independent aggregate metrics. Runs whose summary
has `failures` are listed with scenario, run, and problem text; they are marked excluded/unreliable
and omitted from presence counts, and the counts state how many runs were excluded. Runs whose main
session had zero tool calls stay in the aggregates as valid zero-skill/zero-subagent runs and are
listed as `Runs with zero tool calls in the main session: scenario/run`; child zero-tool sessions
appear only in the table notes. `--json` writes the same metrics to a local file; `--compare` prints
a before/after table of those metrics only.

### Manual fallback

If the collector cannot be used, reproduce the same steps by hand:

```sh
opencode session list --format json
opencode session export <sessionID> > docs/eval/sessions/<scenario>-run<N>-<sessionID>.json
bun scripts/eval-count-tool-calls.ts docs/eval/sessions/<scenario>-run<N>-<sessionID>.json
```

Exports, summaries, and metrics stay under `docs/eval/sessions/` and are never committed.

Optional aggregate cross-check (documented; time-range/project totals only, no per-session
breakdown and no skill/agent IDs):

```sh
opencode stats --tools --json
```

The counter prints totals for **every** tool name it sees, so a renamed `skill` or `subagent`
tool is visible. It prints separate completed and failed ID lists: skill IDs from
`state.input.id`, subagent agent IDs from `state.input.agent`, and child session IDs from
`state.metadata.sessionID` or the camelCase `state.metadata.sessionId` seen in older exports.
The **MISMATCH** warning compares `type: "skill"` messages only with **completed** `skill` tool
calls, so failed calls do not create a false mismatch. It also prints **Failed calls by tool
name** for every tool in an `error` state, which makes calls to non-existent or legacy tools
visible. Copy completed IDs into the "Skill calls (IDs)" / "Subagent calls (IDs)" columns and
failed IDs into "Failed IDs". Streaming string inputs
are ignored and listed under "Incomplete". If the counter prints `0 tool calls found in file` or
`unexpected format`, record that as a measurement failure, not as a zero.

Subagent calls create child sessions whose IDs appear in tool metadata. The export of the main
session does not contain their internal tool calls, so the collector exports each child and marks
provenance as `main` or `child` in the summary. In the manual flow, export each child into
`docs/eval/sessions/`, run the counter on each, and record whether you did so in the "Child
sessions exported?" column. Use `no` only when there were no children.

### Frozen results

Baseline results are saved as the frozen file `docs/eval/results/baseline-2026-11.md` only when
the user pastes real results; do not create it until then. The scenario prompts and the playground
commit `99419d2` are frozen until the after run.

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
| 1 Feature (larger, multi-file) | build | Add a `created_at` timestamp to widgets: add a migration, return it from GET /widgets, show it in WidgetList, add tests, and update the README. | `api-conventions`, `backend-patterns`, `database`, `database-migration`, `frontend-patterns`, `documentation`, `testing`, `code-style` | `backend-developer`, `database-engineer`, `frontend-developer`, `docs-writer`, `qa-engineer` |
| 2 Bug investigation | plan | GET /widgets?limit=N returns one more item than N. Find the root cause and report. Do not change files. | `debugging` | `senior-developer`, `deep-thinker` |
| 3 Refactor | build | Remove the duplicated validation logic between the handlers without changing behavior; keep tests passing. | `refactor-planner`, `code-simplifier`, `code-style`, `testing` | `refactor-planner`, `senior-developer` |
| 4 Git commit | build | Stage all current changes and commit them with a Conventional Commit message. Do not push. | `git-workflow` | none |
| 5 Docs | build | Update the README so the run and test sections are accurate and clear. | `documentation`, `no-ai-slop` | `docs-writer` |
| 6 DB schema | build | Add a `tags` table linked to widgets with a migration, update the schema docs and tests. | `database`, `database-migration` | `database-engineer` |
| 7 Frontend | build | Add a loading state and an empty state to the WidgetList component. | `ui-design`, `frontend-patterns` | `frontend-developer`, `ui-ux` |
| 8 Security review | plan | Review the API and database code for security vulnerabilities. Report findings only; do not change files. | `security-review` | `security-auditor` |
| 9 Tests | build | Write unit tests for the widget validation function covering valid input, empty name, too-long name, and non-string name. | `testing`, `test-planning` | `qa-engineer` |
| 10 Trivial control | build | Fix the typo in the README heading. | none (expected, not required) | none (expected, not required) |

Scenario notes:
- Scenario 1 is feasible on the clean playground commit; it was dry-run and the playground was
  reset afterwards. The playground already has `POST /widgets`, so the task adds a field across
  migration, API, UI, tests, and docs instead of adding that endpoint.
- Scenario 6: the playground has no schema documentation yet, so creating it is acceptable.
- Scenario 4 precondition: after the reset and before starting the session, append one arbitrary
  line to the playground README so there is an uncommitted change to commit.

## Results table template

Run every scenario at least twice (Run 1 and Run 2) in separate fresh sessions. Write `none`
when the counter printed `(none)`. Completed IDs go in the call columns; failed IDs and child
session IDs come from the counter, and child-session export status from
`opencode session list --format json`.

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
