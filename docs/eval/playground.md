# Agent playground

A throwaway measurement target for the baseline and after runs. It lives **outside** this
repository so that the global installed OpenCode config, agents, skills, and commands are what
get measured. It deliberately contains no `opencode.jsonc`, no `AGENTS.md`, no `.opencode/`, and
no `.agents/`.

- Path: `C:/Users/thomi/workspaces/my-projects/agent-playground` (sibling of `agent-skills`)
- Git: its own repository, branch `main`, one clean initial commit `99419d2`
- Size: 10 files, 204 lines total
- Test result on the clean commit: `bun test` -> 4 passed, 0 failed

## Stack and layout

Bun + TypeScript, no third-party dependencies. The API uses only Bun built-ins (`Bun.serve`,
`bun:sqlite`). The database is in memory and recreated from `migrations/` on each start.

```text
agent-playground/
├── README.md                     run/test docs (contains seeded typo)
├── migrations/001_widgets.sql    widgets table + two seed rows
├── package.json                  dev = bun run src/api.ts, test = bun test
├── public/index.html             loads the widget list
├── src/api.ts                    HTTP routes
├── src/db.ts                     migration runner
├── src/frontend/WidgetList.ts    minimal list component
├── src/validation.ts             name validation helper
├── tests/api.test.ts             4 existing tests
└── tsconfig.json
```

Routes: `GET /widgets`, `GET /widgets/search?q=...`, `POST /widgets`, `PUT /widgets/:id`.

## Recreate or reset

The folder already exists. To reset it to the clean commit before any run:

```sh
cd ../agent-playground
git reset --hard HEAD
git clean -fd
bun test
```

Then start a fresh OpenCode session **from the playground directory**. Do not reuse a session.

If recreating from scratch, create the files above, run `git init -b main`, stage everything,
and make one initial commit. `bun install` is not needed because there are no dependencies.

## Config isolation

Run `opencode debug config` from the playground directory, not from `agent-skills`. On this
machine it reports only:

```text
document: C:\Users\thomi\.config\opencode\opencode.jsonc
directory: C:\Users\thomi\.config\opencode
```

No project-local or ancestor OpenCode config was found above the playground. The only ancestor
match was an unrelated `C:\Users\thomi\.agents` directory, which is not an OpenCode config
source. This means the measured behavior comes from the user's global install.

## Seeded issues (do not reveal these in any prompt)

These are intentionally present on the clean commit. The measurement prompts describe user
symptoms or goals only; they must never name the root cause or point to the seeded defect.

1. **Off-by-one** - `src/api.ts`, `GET /widgets`: `LIMIT ${limit + 1}` returns one more row than
   requested when the table has enough rows.
2. **Duplicated validation** - `src/api.ts`: the `POST /widgets` and `PUT /widgets/:id` handlers
   each repeat the same inline name checks instead of calling `validateName` from
   `src/validation.ts`.
3. **SQL string concatenation** - `src/api.ts`, `GET /widgets/search`: the `q` parameter is
   interpolated directly into `LIKE '%${query}%'`.
4. **README typo** - `README.md`: the install heading reads `## Instal` instead of `## Install`.
5. **Missing UI states** - `src/frontend/WidgetList.ts`: no loading state and no empty state;
   `render()` replaces the list contents immediately after `fetch` resolves.

Everything else is correct, and the four existing tests pass on the clean commit. In particular,
no test asserts the buggy `limit` behavior, so the suite stays green until a scenario changes it.
