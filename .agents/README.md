# Vendored Tooling

Development-only tooling forked from Anthropic upstreams, pinned under `.agents/`. This directory is excluded from npm publish (package.json `files` whitelist), tsc (`tsconfig.json` include list), and ESLint (`eslint.config.js` globalIgnores), and is never installed by the CLI.

## Sources and pins

| Path | Upstream | Upstream commit (pinned) | Vendored path |
|---|---|---|---|
| `.agents/skills/skill-creator/` | anthropics/claude-plugins-official | `c447c3207a425bc4e2a0d068435f64b0477ae981` | `plugins/skill-creator/skills/skill-creator` |
| `.agents/plugins/plugin-dev/` | anthropics/claude-code | `bf7d404e26a5fb6167d21b46c93a2bf6c22ab274` | `plugins/plugin-dev` |

Vendored 2026-09-21. To sync a newer upstream version: sparse-clone the repo, copy the subtree, update the commit hash above, and re-apply the shim (see below). Never edit vendored files to adapt behavior.

## Executor shim

Upstream scripts shell out to `claude -p`. This repo pins OpenCode as the executor, so a shim script named `claude` must be on PATH (or invoked via a config flag) that translates:

```
claude -p <prompt> --output-format stream-json --verbose --include-partial-messages
claude -p --output-format text
```

to `opencode run` with the pinned model/agent, emitting compatible stdout. Two call sites exist in vendored code:

1. `skills/skill-creator/scripts/run_eval.py` (trigger eval): spawns `claude -p <query> --output-format stream-json --verbose --include-partial-messages`, sets `--model` if given, then parses NDJSON events from stdout. Detection logic (do not break):
   - `type: "stream_event"` with `event.type == "content_block_start"` and `content_block.type == "tool_use"`, tool name in `("Skill", "Read")`; later deltas accumulate `input_json_delta.partial_json` and match the generated command name.
   - Fallback: `type: "assistant"` message whose content contains a `tool_use` item with `name == "Skill"` or `name == "Read"`.
   - `type: "result"` ends the stream.
2. `skills/skill-creator/scripts/improve_description.py` (`_call_claude`): spawns `claude -p --output-format text` with the prompt on stdin, expects plain text on stdout.

`claude-shim.py` (this directory) implements both modes. Point the vendored scripts at it by placing a `claude` launcher on PATH that runs `python claude-shim.py %*`, or by adapting the runner bridge under `evals/`.

## Usage (offline, no model quota)

- Review UI: `python .agents/skills/skill-creator/eval-viewer/generate_review.py --static <output.html>`
- Benchmark aggregation: `python .agents/skills/skill-creator/scripts/aggregate_benchmark.py`
- Packaging/validation: `package_skill.py`, `quick_validate.py`

## Not ported

`.agents/plugins/plugin-dev/` stays in Claude Code format on purpose: it is reference material consulted while authoring (7 skills, 3 agents, 1 command), not installed or enforced. This repo's own conventions (agentskills.io SKILL.md spec, OpenCode agent format) remain the enforceable standard.
