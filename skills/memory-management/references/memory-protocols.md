# Memory Protocols

Deep-dive reference for the `memory-management` skill: entry formats for memory
files, failure modes to avoid, and trust boundaries when resuming work.

---

## Entry Formats

### `DECISIONS.md` entry

```markdown
### D-014: Use Postgres LISTEN/NOTIFY instead of Redis pub/sub (2026-09-06)

- **Context:** Job fan-out needed sub-second delivery; team knows only SQL.
- **Decision:** Postgres LISTEN/NOTIFY with a jobs table.
- **Rejected:** Redis (extra infra to operate), polling (latency).
- **Consequence:** Connection pool must keep dedicated listener connections.
```

Rules: sequential IDs, date every entry, `Rejected` prevents re-litigating,
`Consequence` records the bill someone will pay later.

### `Continue Here` section in `TASKS.md`

```markdown
## Continue Here

- Objective: ship rate limiter for public API
- Done: token bucket in Redis (tested), middleware wired
- Decisions: Redis over in-memory (multi-instance deploy) - see DECISIONS.md D-012
- Blocker: none
- Next: write integration tests for 429 path, then docs - owner: backend subagent
```

---

## Failure Modes

### Memory rot

Memory files accumulate stale claims that nobody verifies. Symptoms: `TASKS.md`
lists work that was merged weeks ago; `ARCHITECTURE.md` shows services that no
longer exist.

Counter-measures:

- At session start, reconcile `TASKS.md` against `git log` and the tree.
- When a memory file is proven wrong, fix it immediately - do not work around it.
- Prune `## Done` and `## Someday` sections when they exceed one screen.

### Split truth

The same fact recorded in two places (e.g., the API contract in both `SPEC.md`
and a `DECISIONS.md` entry). They will diverge.

Counter-measure: one owner file per fact. Other files reference it by name
("contract defined in SPEC.md"), never copy it.

### Transcript-dependence

Relying on "as discussed earlier" instead of a file. The earlier discussion is
gone after compaction or session end.

Counter-measure: if something said in chat matters beyond this session, write
it to a memory file in the same turn.

### Over-persistence

Recording everything produces noise that hides the signal; a 900-line
`TASKS.md` is unreadable and will not be read.

Counter-measure: persist outcomes, decisions, and blockers - not narration.

---

## Trust Boundaries

- **Never persist secrets.** Tokens, API keys, connection strings, and
  credentials must not appear in `TASKS.md`, `DECISIONS.md`, `SPEC.md`, or
  `ARCHITECTURE.md`. Point to the secret's location (e.g., "token in
  `.env`, see README") instead of its value.
- **Never persist generated state.** Build outputs, lockfile state, and test
  results can be re-derived from the repo; persisting them creates staleness.
- **Assume memory is a hypothesis.** Every claim in a memory file is "as of its
  last edit". Verify against the working tree before acting, and after any
  merge, rebase, or branch switch.
- **Cross-branch caution.** Memory files are committed per branch. After
  switching branches, re-read them - the resume point may belong to a
  different line of work.
