# DECISIONS.md

Architectural decisions, conventions, and known issues for the agent-skills project.

---

## Decisions

Key architectural decisions. Review before making changes that touch these areas.

### Orchestrator as subagent, built-in plan/build as primary

OpenCode built-in `plan` and `build` agents serve as the primary user interface. The `orchestrator` subagent handles task decomposition, delegation, and verification. Orchestrator has `subagent` permission (except self-delegation) to coordinate specialized subagents.

### Agent selection: hardcoded routing in orchestrator prompt

Task to agent mapping is hardcoded in the orchestrator prompt, not a custom tool. Provides full control and reliability.

### Quality verification: dual-layer (skill-level + project quality gate)

Verification has two layers: (1) domain-specific checklist in each SKILL.md executed by the subagent, (2) a project quality gate where the agent runs the project's own lint, typecheck, and test commands. qa-engineer has access to run tests, typecheck, lint.

### Resumable Subagent Recovery (`sessionID`)

OpenCode surfaces failed subagent tool calls with a resumable `sessionID`. If a subagent task fails or needs iteration, pass the `sessionID` back to the `subagent` tool with additional guidance to resume the child session rather than restarting from scratch.

### Global rules format: concise + grouped by task type

`instructions/AGENTS.md` is deliberately concise (~800 tokens) with intent-based rules. Domain detail lives in SKILL.md (progressive disclosure).

`instructions/OPENCODE.md` documents OpenCode built-in tools and model-execution guidelines. It is NOT auto-loaded by the installer (PR #52: "stop loading OPENCODE.md automatically"); `config/opencode.jsonc` loads only `AGENTS.md`. Consult `OPENCODE.md` on demand as a reference when working with OpenCode built-in tools.

### Priority Ladder

Rules have explicit priority order when they conflict: Anti-Hallucination > Security > Testing > Code Quality > Evidence & Source Citation > Self-Correction > Task Recovery > Communication > Chain of Thought > Decision-Making > Context Awareness > Final Recommendation.

### Intent-based tool references

Rules describe intent, not specific tools. "Search instead of reading files" rather than "use rg or grep". This keeps rules cross-platform and independent of environment tools.

### Task Classification

Every request is classified as Analysis, Implementation, or Both at the start. Agents apply only the relevant rule set, reducing cognitive overhead and token waste.

### OpenCode V2 plugin API migration

OpenCode 2.1.4 loads V2 plugins only: each plugin file must default-export a definition with an `id` and an `effect` or `setup` function. The V1 named-export plugin functions from `@opencode-ai/plugin` are rejected with "Plugin must export a default definition with an id and an effect or setup function." The hooks are separate plugins with stable IDs: `secrets-scanner.ts` (`ctx.tool.hook("execute.before")`) and `tool-guardian.ts` (`ctx.shell.hook("create.before")`). `@opencode/plugin` 2.2.5 is a devDependency and the OpenCode host resolves the runtime import to its own copy. `plugin/agent-skills.ts` was removed because composition is no longer needed; the installer deletes the stale installed file when its hash matches the manifest. Found during the 0.5.1 install verification: all four V1 files failed to load. Date: 2026-10-23; compaction removal recorded 2026-11-25.

### Tool guard hooks: throw-to-block in V2 tool and shell hooks

`secrets-scanner` and `tool-guardian` are separate V2 plugins in `plugin/` with stable IDs. They register their own hooks during `setup`: secrets-scanner uses `ctx.tool.hook("execute.before")` and inspects content-bearing string fields only (`content` for write, `newString` for edit; `oldString` and `filePath` are ignored so secret removal is not blocked); tool-guardian uses `ctx.shell.hook("create.before")` and inspects shell commands only. They block by throwing an error from the hook. Specific-path deletes (`rm -rf node_modules`), `git reset --hard`, and `--force-with-lease` are deliberately allowed; guards are a safety net, not a permission system. Plugins are disabled through the `plugins` array in `opencode.jsonc` with a `-` prefix on the stable ID; OpenCode V2 does not consume `AGENT_SKILLS_DISABLE_*` environment variables.

A 2026-10-20 development-tools audit closed token-level gaps in the delete guard: the old single `DELETE_TARGET` regex missed glob targets (`rm -rf /*`, `~/*`, `$HOME/*`, `C:\*`), quoted home vars (`"$HOME"`, `"$env:USERPROFILE"`), traversal forms that resolve to a root (`/.`, `/..`, `/tmp/..`), and Windows-native `del` / `rmdir` with `/s` plus `/q` or `/f`. Detection is now token-based: each operand is quote-stripped and slash-normalized, then checked against root, home, and drive-root predicates with lexical resolution, so `rm -rf /*` is blocked while `rm -rf ./build/*` stays allowed. `git push --force-if-includes` is no longer blocked as a force-push false positive. Regression cases live in `tests/plugin-guards.test.ts`.

### Agent frontmatter uses the V2 permissions array

All 20 agent files use the OpenCode V2 `permissions` array of `{action, resource, effect}` entries, with `shell` and `subagent` replacing the V1 `bash` and `task` maps. Provider options such as temperature live under `request.body`; top-level `temperature`, `permission`, `bash`, `task`, and `tools` keys are not used. `tests/agent-permissions.test.ts` enforces the shape, the read permission, orchestrator delegation plus self-delegation deny, and the absence of language-specific shell resources. This closes the V1 known gap recorded in the 2026-10-22 audit.

### Conventional git skills merged into git-workflow

Initially shipped as standalone skills (`conventional-branch`, `conventional-commit`) positioned as deep-dives under the `git-workflow` umbrella. Later merged into git-workflow as `references/conventional-branch.md` and `references/conventional-commit.md` after a collision audit showed a single git action lit up three skills at once. The merge rule applied across the catalog: one skill per agent moment, thin overlapping skills become references of the parent that owns the trigger surface.

### Agent-agnostic by layering (catalog vs integration vs dev tooling)

The catalog (skills in open Agent Skills format) carries no harness assumptions; the integration layer (agents/*.md markup, plugin hooks, config, installer) is OpenCode-specific and swappable. Future support for other agent runtimes (Claude Code, Codex CLI, etc.) is an integration-layer adapter only. Consequence for authoring: new skills must not assume OpenCode-specific behavior in SKILL.md bodies; harness-specific instructions belong in the integration layer (agent files, plugin).

### Installer: ownership-aware plan/execute with a manifest

The installer is OpenCode-only and writes only under the OpenCode global config root (`~/.config/opencode/`). It never writes `~/.agents/`; that path is a compatibility location used by other tools, and copies left by older installer versions are untouched.

Installation is split into a planner (`src/lib/install/plan.ts`) and an executor (`src/lib/install/execute.ts`). The planner scans the repository, hashes every source file with SHA-256, reads the ownership manifest, and classifies each path as create, update, delete, or keep before any write. The executor performs the plan, writes the manifest atomically, and runs only when the plan contains changes.

The manifest at `<configRoot>/.agent-skills-manifest.json` is the ownership source of truth. It records the SHA-256 hash, install mode, and install timestamp per managed path. Managed files that still match their recorded hash are updated or deleted; files modified by the user and unmanaged third-party files are preserved. The first run without a manifest adopts existing files at shipped paths and backs up the config root before updating. This replaced the previous copy-and-overwrite deploy, sync, and symlink commands, which were deleted and consolidated into `install`.

`--target` escapes are rejected by path containment checks, so a crafted source path cannot write outside the config root. Only the config root is backed up; `--backup-path` is a custom backup root, not a merge source.

### Install modes: merge by default, replace explicit, symlink for development

`merge` is the default. It updates managed files, preserves user-modified and unmanaged files, and deletes stale managed files only when unmodified. `replace` is explicit and aborts on unmanaged conflicts unless `--force` is set. `symlink` remains for live development and falls back to a copy when symlinks are unavailable. This keeps the safe path as the default while preserving an explicit escape hatch.

### Config merge: user values win, unknown keys survive

`opencode.jsonc` and `tui.jsonc` are deep-merged with the repository templates. User values win, template values fill only missing keys, arrays are atomic, and unknown keys plus V2 keys (`permissions`, `plugins`, `providers`, `agents`, `mcp`, `watcher`) are preserved. `default_agent` and `small_model` are never forced; `instructions` keeps user entries and appends `AGENTS.md` only when missing; a top-level `subagent_depth` is migrated to `experimental.subagent_depth`. An existing `opencode.json` or `tui.json` is updated in place instead of creating a duplicate `.jsonc` file. Config sources are config-root files plus `OPENCODE_CONFIG`/`OPENCODE_TUI_CONFIG`; project-local cwd configs are not merged into the global config. Invalid config aborts in merge mode unless `--force` is set. JSONC comments are not preserved across a rewrite; the installer warns instead of adding a comment-preserving dependency.

### Release notes: changelogen emoji headings kept, bodies applied via notes-file

changelogen emits named section headings such as Enhancements, Fixes, Refactors, Documentation, and Chore into CHANGELOG.md and release output. CHANGELOG.md is the documented exception to the no-emoji rule. GitHub Release bodies created with inline shell interpolation (`bun -e`, PowerShell strings) were silently truncated at the first `#` character. Practice: extract the version section from CHANGELOG.md into a temporary file and apply it with `gh release create/edit --notes-file <file>`, then verify the body via `gh release view --json body` before moving on.

### Agent file markup: XML tags retained (evaluated against modern conventions)

Evaluated converting the 20 `agents/*.md` bodies from XML tags (`<role>`, `<skills_to_load>`, `<constraints>`, `<workflow>`, `<output_format>`) to markdown headings after observing that community agent files (Claude Code agent collections, official OpenCode docs examples) use `#`/`##` headings. Primary sources checked: the agentskills.io specification states the body has "no format restrictions" and its no-XML rules apply to frontmatter name and description fields, not the body; Anthropic prompting best practices still list "Structure prompts with XML tags" as an active general principle for current Claude models; community guides for writing subagent prompts actively recommend XML blocks such as `<constraints>` and `<output_format>`; OpenCode agent docs prescribe no body format at all. Decision: keep XML tags. Rationale: agent files are system prompts rather than documents, and XML structuring is an officially recommended prompting technique; the three-way sync invariant (skills_to_load against AGENTS.md Key Skills against the orchestrator delegation list) and the one-grep audit depend on consistent markup; 18 of 20 agents shipped with this format since the initial commit. A conversion would also contradict skills/prompt-design/SKILL.md, which explicitly teaches XML tags as a technique. If revisited, protect the 4 output templates containing `##` headings (brainstormer, deep-thinker, project-manager, researcher) before any mechanical conversion.

### Documentation audit: PRD/ARCHITECTURE agent-roster drift resolved

A documentation audit found `PRD.md` FR-2 listing only 13 of the 20 agents actually defined in `AGENTS.md`/`agents/`, the `ARCHITECTURE.md` System Diagram showing only 10 of 20 agents as individual nodes, and the `ARCHITECTURE.md` Agent Roster table listing only 15 of 20. All three are fixed: PRD.md FR-2 now lists all 20 agents and defers to `AGENTS.md` (Agent Orchestra section) as the canonical roster source; the System Diagram is regrouped by domain (Engineering, Product and Planning, Quality and Security, Delivery, Reasoning and Content) instead of one node per agent, so it does not need updating every time the roster changes; the ARCHITECTURE.md roster table now lists all 20 agents.

### Dependency selection: Bun native first, then unjs, then third-party

New code prefers Bun built-in APIs before adding a dependency, because they ship with the runtime and add no install, audit, or supply-chain surface. The order of preference is:

1. Bun native APIs: `Bun.file`, `Bun.spawn` and `Bun.$`, `Bun.Glob`, `Bun.YAML`, `Bun.TOML`, `Bun.JSON5`, `Bun.semver`, `Bun.env`, plus the built-in test runner and bundler.
2. unjs.io packages (`citty`, `confbox`, `consola`, `pathe`, `pkg-types`, `scule`, `std-env`) when a Bun native API does not cover the need and the package stays small and runtime-agnostic.
3. Any other third-party library only when neither layer covers the need, after checking maintenance activity, install weight, and license.

Reference: <https://bun.com/llms.txt>. An existing dependency that Bun now covers natively is a migration candidate, not an obligation; a migration must keep behavior identical and pass typecheck, lint, and tests before it lands.

Dependency maintenance follows from the same policy: Dependabot groups Bun updates at the minor and patch levels only, TypeScript major updates stay ignored until `typescript-eslint` supports TypeScript 7, and major updates for other packages arrive as individual pull requests so they get a deliberate review instead of riding along inside a group.

Applied on 2026-10-26: frontmatter parsing in the test suite now calls `Bun.YAML.parse`, so the tests no longer import the `yaml` package. `scripts/opencode-frontmatter.js` keeps `yaml` on purpose: ESLint runs plugins under Node, and a runtime check confirmed `bun run lint` executes ESLint with `typeof Bun` undefined, so a Bun-only parser would turn every frontmatter into a parse failure. Editor ESLint integrations have the same constraint. A dependency that cannot move to a Bun API because its host runtime is not Bun stays, and the reason is recorded here.

### TASKS.md support removed in favor of OpenCode V2 native compaction

The catalog previously required a project-local `TASKS.md`, injected it into every session via `instructions`, and patched the compaction prompt with a custom plugin. OpenCode V2 compaction already produces a structured summary with objective, decisions, completed/active work, blockers, and next move, and re-injects current instruction files after compaction. The plugin was a V1-era workaround and could not solve the real context problem: compaction cannot create room when fixed instructions dominate the window. Decision: delete `plugin/compaction.ts`, remove the rule from global instructions, trim dev instructions to `AGENTS.md` and `DECISIONS.md`, keep live state in the conversation, and mirror durable backlog items in the project's issue tracker. This is a breaking change for users who relied on `TASKS.md`; it requires a release note. Date: 2026-11-25.

### Slash commands reduced to commit and ship-pr

The catalog shipped 17 slash commands, most of which duplicated skills or agent workflows and competed for the user's attention. Only `/commit` and `/ship-pr` had repeated successful use. Decision: keep those two, make them deterministic (`agent: build`, `subagent: false`, explicit fallback when `git-workflow` is unavailable), and let the remaining workflows be reached through skills and agents. The merge installer deletes the stale command files when their hashes still match the manifest. Date: 2026-11-25.

### Skill discovery tuned for triggering reliability

OpenCode advertises only skills with a description that are not hidden by `metadata.opencode/autoinvoke: false` or by the selected agent's `skill` permission, and it loads the body only when the model calls the `skill` tool. An agent's `<skills_to_load>` block is prose, not an auto-load mechanism. Decision: write descriptions as trigger-only "Use when..." statements with one branch per trigger, hide orchestration-only skills from auto-discovery, and give every agent an inline minimal contract so a missing or blocked skill degrades gracefully instead of silently changing output. Cross-skill pointers are one-way and optional; `@`-links are avoided because they force-load files. Date: 2026-11-25.

### SKILL.md bodies stay Markdown; agent files stay XML

The agentskills.io specification states the Markdown body after frontmatter has no format restrictions, and OpenCode injects that Markdown body into the conversation. External skill collections use Markdown headings, and there is no evidence XML improves triggering. Agent files are system prompts, where XML structuring remains useful and the three-way sync invariant depends on consistent markup. Decision: do not convert SKILL.md bodies to XML; keep XML tags in `agents/*.md`; never put XML in frontmatter `name` or `description`. Date: 2026-11-25.

### Workflow routing by task type with a closed review gate

The former workflow was one linear chain from discussion to improvement. The new one classifies the request first: feature development goes through planning and file picking, bug investigation through `deep-thinker` and `researcher`, and refactoring through file picking and planning. All paths converge on implementation and then a `qa-engineer` review gate that loops back on failure, at most three retries. Because only `orchestrator` has `subagent` permission, the sequence is coordinated there rather than through nested delegation. Date: 2026-11-25.

### content-strategy merged into copywriting

`content-strategy` was a separate skill whose description explicitly delegated landing page copy and CTA formulas to `copywriting`; the marketing agent loaded both for the same authoring moment. Decision: move channel planning, brand voice, calendars, content types, and hard rules into `copywriting/references/content-strategy.md`, move its templates to `copywriting/assets/content-templates.md`, and drop the standalone skill. The merged description covers public-facing copy but deliberately does not claim prose editing, which remains `no-ai-slop`. Catalog count drops from 35 to 34. Date: 2026-11-25.

### database-migration merged into database

`database` already claimed the "migration" trigger in its description while delegating execution to `database-migration`, and `database-engineer` loaded both. Decision: put the rollback rule, expand-contract pattern, safe change patterns, backfills, and pre-flight checklist into `database/references/migrations.md`, remove the duplicate trigger and the standalone skill, and update `backend-patterns` to point at the reference. Catalog count drops from 34 to 33. Date: 2026-11-25.

---

## Conventions

### Agent Permission Convention (V2)
- Every agent must declare `permissions` as an ordered array of `{action, resource, effect}` entries
- Every agent must grant `read` on `*`
- No agent may use the legacy `permission`, `bash`, `task`, or `tools` maps
- Read-only agents deny `edit` and ask for `shell`
- Agents that run verification may allow `shell` on `*`
- Content and planning agents use `shell: ask` - usable with user confirmation, never silent
- Only `orchestrator` receives `subagent: allow` on `*` plus `subagent: deny` on `orchestrator`; no agent uses top-level `task`
- Temperature belongs under `request.body.temperature`, not at the top level
