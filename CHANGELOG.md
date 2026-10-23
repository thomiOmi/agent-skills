# Changelog


## v0.5.1

[compare changes](https://github.com/thomiOmi/agent-skills/compare/v0.5.0...v0.5.1)

### 🩹 Fixes

- **plugin:** Migrate to OpenCode V2 plugin API ([10107de](https://github.com/thomiOmi/agent-skills/commit/10107de))

### 📖 Documentation

- **tasks:** Mark 0.5.0 release complete ([f4bb2a3](https://github.com/thomiOmi/agent-skills/commit/f4bb2a3))

### ❤️ Contributors

- Thomi Syauqi ([@thomiOmi](https://github.com/thomiOmi))

## v0.5.0

[compare changes](https://github.com/thomiOmi/agent-skills/compare/v0.4.0...v0.5.0)

### 🚀 Enhancements

- Add eval runner --limit flag, judge flag guard, and exit code on failures ([#31](https://github.com/thomiOmi/agent-skills/pull/31))
- Add common pitfalls sections to four thin skills and refresh audit ([#32](https://github.com/thomiOmi/agent-skills/pull/32))
- Expand agent roster to 20 for agency structure ([#36](https://github.com/thomiOmi/agent-skills/pull/36))
- Add frontend-patterns, backend-patterns, database-migration skills ([#37](https://github.com/thomiOmi/agent-skills/pull/37))
- Add project-lifecycle skill and strengthen code-review for tech lead ([#38](https://github.com/thomiOmi/agent-skills/pull/38))
- **evals:** Resume interrupted runs and cap executor runtime ([7689966](https://github.com/thomiOmi/agent-skills/commit/7689966))
- Vendor skill-creator and plugin-dev under .agents with executor shim ([d774a38](https://github.com/thomiOmi/agent-skills/commit/d774a38))
- Emit skill-creator schema artifacts from eval runner ([8ce9ef4](https://github.com/thomiOmi/agent-skills/commit/8ce9ef4))
- Support agent eval targets in the eval runner ([ad61811](https://github.com/thomiOmi/agent-skills/commit/ad61811))
- **skills:** Add config-management skill ([24171b6](https://github.com/thomiOmi/agent-skills/commit/24171b6))
- **plugin:** ⚠️  Remove quality-verifier custom tool ([849e3df](https://github.com/thomiOmi/agent-skills/commit/849e3df))
- **installer:** Add ownership-aware merge installer ([eb28d97](https://github.com/thomiOmi/agent-skills/commit/eb28d97))

### 🩹 Fixes

- Dedupe skill trigger phrases and add catalog collision regression tests ([#30](https://github.com/thomiOmi/agent-skills/pull/30))
- **evals:** Harness validity (grading key isolation, build agent) + git-workflow defaults ([#43](https://github.com/thomiOmi/agent-skills/pull/43))
- **evals:** Put the task before skill instructions in the prompt wrapper ([#44](https://github.com/thomiOmi/agent-skills/pull/44))
- **skills:** Repair broken dependency graph in task decomposer ([de40e31](https://github.com/thomiOmi/agent-skills/commit/de40e31))
- **skills:** Repair mojibake and strip BOM from markdown files ([01a12ad](https://github.com/thomiOmi/agent-skills/commit/01a12ad))
- **plugin:** Real quality checks, GNU long-form delete guard, drop deprecated tool ([ad488a0](https://github.com/thomiOmi/agent-skills/commit/ad488a0))
- **docs:** Correct Mermaid diagram syntax ([1e6a690](https://github.com/thomiOmi/agent-skills/commit/1e6a690))
- **package:** Include installer sources in published files ([7686b4c](https://github.com/thomiOmi/agent-skills/commit/7686b4c))
- **installer:** Deploy canonical global instructions ([26ed8b0](https://github.com/thomiOmi/agent-skills/commit/26ed8b0))
- **plugin:** Block glob, quoted, and Windows-native delete bypasses ([d2903db](https://github.com/thomiOmi/agent-skills/commit/d2903db))

### 💅 Refactors

- Centralize eval case files under evals/cases ([#35](https://github.com/thomiOmi/agent-skills/pull/35))
- Sharpen agent role boundaries from audit ([#39](https://github.com/thomiOmi/agent-skills/pull/39))
- Normalize devops and security-auditor agent markup to XML tag convention ([#40](https://github.com/thomiOmi/agent-skills/pull/40))
- **agents:** Migrate frontmatter permission maps to OpenCode v2 permissions array ([c2d774e](https://github.com/thomiOmi/agent-skills/commit/c2d774e))

### 📖 Documentation

- Document changelogen emoji headings and release notes-file practice ([4848533](https://github.com/thomiOmi/agent-skills/commit/4848533))
- Mark F7 trust boundaries as done after verification ([#33](https://github.com/thomiOmi/agent-skills/pull/33))
- Mark F4 and F6 audit items as done and update task backlog ([#34](https://github.com/thomiOmi/agent-skills/pull/34))
- Record agent markup decision to keep XML tags ([#41](https://github.com/thomiOmi/agent-skills/pull/41))
- Park eval runner as baseline-only, choose DeepEval for LLM-judge ([#42](https://github.com/thomiOmi/agent-skills/pull/42))
- **tasks:** ⚠️  Record iteration-2 grading weaknesses found in review ([06f67bf](https://github.com/thomiOmi/agent-skills/commit/06f67bf))
- Update root docs for vendored tooling and refactor evals to evals/src ([17f03bc](https://github.com/thomiOmi/agent-skills/commit/17f03bc))
- **tasks:** Mark Fase 2 vendoring complete with verification results ([066a375](https://github.com/thomiOmi/agent-skills/commit/066a375))
- **tasks:** Close vendored-tooling roadmap via PR #45 ([#45](https://github.com/thomiOmi/agent-skills/issues/45))
- **tasks:** Record collection audit fixes via PR #46 ([#46](https://github.com/thomiOmi/agent-skills/issues/46))
- **agents:** Document explore/scout/general as built-in subagents ([99c6b7d](https://github.com/thomiOmi/agent-skills/commit/99c6b7d))
- **tasks:** Mark P2-3 config-management resolved ([8a5050a](https://github.com/thomiOmi/agent-skills/commit/8a5050a))
- Fix root-docs audit findings (roster drift, counts, task-decomposer deprecation) ([826bc07](https://github.com/thomiOmi/agent-skills/commit/826bc07))
- Add document ownership map and fix self-contradicting format rules ([b88a976](https://github.com/thomiOmi/agent-skills/commit/b88a976))
- Drop duplicate agent columns from ARCHITECTURE and PRD roster tables ([a3737aa](https://github.com/thomiOmi/agent-skills/commit/a3737aa))
- **skills:** Remove duplicate reference content delegated to other skills ([3092650](https://github.com/thomiOmi/agent-skills/commit/3092650))
- **skills:** Move migration execution ownership to database-migration ([4081e30](https://github.com/thomiOmi/agent-skills/commit/4081e30))
- **skills:** Translate stray Indonesian fragments to English ([b77fbca](https://github.com/thomiOmi/agent-skills/commit/b77fbca))
- Enforce English-only repo files, discussion may use any language ([ab2b32a](https://github.com/thomiOmi/agent-skills/commit/ab2b32a))
- Add comprehensive evaluation report for agents and skills ([#48](https://github.com/thomiOmi/agent-skills/pull/48))
- **tasks:** Restore audit roadmap ([7fcd422](https://github.com/thomiOmi/agent-skills/commit/7fcd422))
- Align source-of-truth references ([51b96bc](https://github.com/thomiOmi/agent-skills/commit/51b96bc))
- Align contribution task rules ([cdd798a](https://github.com/thomiOmi/agent-skills/commit/cdd798a))
- Normalize repository language and encoding ([3861553](https://github.com/thomiOmi/agent-skills/commit/3861553))
- **tasks:** Archive stale eval roadmap items ([a2ebcbe](https://github.com/thomiOmi/agent-skills/commit/a2ebcbe))
- **tasks:** Record issue hygiene audit ([c48a059](https://github.com/thomiOmi/agent-skills/commit/c48a059))
- **prd:** Remove stale plugin-dev scope ([314de8a](https://github.com/thomiOmi/agent-skills/commit/314de8a))
- Mark evaluation report as historical ([1d24d22](https://github.com/thomiOmi/agent-skills/commit/1d24d22))
- **tasks:** Separate archived roadmap sections ([c1165b3](https://github.com/thomiOmi/agent-skills/commit/c1165b3))
- Clarify placeholder examples ([3a01cbe](https://github.com/thomiOmi/agent-skills/commit/3a01cbe))
- Add public community policies ([b117f54](https://github.com/thomiOmi/agent-skills/commit/b117f54))
- **install:** Align local distribution workflow ([15f1e90](https://github.com/thomiOmi/agent-skills/commit/15f1e90))
- **readme:** Convert structure tree to unicode and sync anatomy docs ([0bd7eab](https://github.com/thomiOmi/agent-skills/commit/0bd7eab))
- **readme:** Restore full unicode tree with counts and instructions note ([77a0941](https://github.com/thomiOmi/agent-skills/commit/77a0941))
- **rules:** Sync audit-fix editorial corrections ([a5a9630](https://github.com/thomiOmi/agent-skills/commit/a5a9630))
- **rules:** Clarify OPENCODE.md is not auto-loaded by installer ([7562c01](https://github.com/thomiOmi/agent-skills/commit/7562c01))
- **install:** Correct OpenCode config examples to v2 shapes ([5d9a25d](https://github.com/thomiOmi/agent-skills/commit/5d9a25d))
- Remove duplicate tests entry in README ([#75](https://github.com/thomiOmi/agent-skills/pull/75))

### 🏡 Chore

- Remove eval harness, vendored tooling; enforce English-only policy ([#47](https://github.com/thomiOmi/agent-skills/pull/47))
- Migrate lint engine to @antfu/eslint-config ([#49](https://github.com/thomiOmi/agent-skills/pull/49))
- **github:** Add contribution templates ([b8ffbaf](https://github.com/thomiOmi/agent-skills/commit/b8ffbaf))
- **ci:** Simplify public CI validation ([053afc3](https://github.com/thomiOmi/agent-skills/commit/053afc3))
- **package:** Remove unused distribution metadata ([8aacb5a](https://github.com/thomiOmi/agent-skills/commit/8aacb5a))
- **installer:** Remove remote source support ([#69](https://github.com/thomiOmi/agent-skills/pull/69))
- **package:** Bump bun to 1.4.4 ([e2acf2c](https://github.com/thomiOmi/agent-skills/commit/e2acf2c))

### 🤖 CI

- Bump Bun version to 1.4.4 in GitHub Actions workflow ([571c865](https://github.com/thomiOmi/agent-skills/commit/571c865))

#### ⚠️ Breaking Changes

- **plugin:** ⚠️  Remove quality-verifier custom tool ([849e3df](https://github.com/thomiOmi/agent-skills/commit/849e3df))
- **tasks:** ⚠️  Record iteration-2 grading weaknesses found in review ([06f67bf](https://github.com/thomiOmi/agent-skills/commit/06f67bf))

### ❤️ Contributors

- Thomi Syauqi ([@thomiOmi](https://github.com/thomiOmi))

## v0.4.0

[compare changes](https://github.com/thomiOmi/agent-skills/compare/v0.3.0...v0.4.0)

### 🚀 Enhancements

- Add eval suites for 8 high-value skills ([#28](https://github.com/thomiOmi/agent-skills/pull/28))
- Complete eval coverage for all skills ([#29](https://github.com/thomiOmi/agent-skills/pull/29))

### 🏡 Chore

- Ignore duplicate heading warnings in generated CHANGELOG ([ed381b3](https://github.com/thomiOmi/agent-skills/commit/ed381b3))

### ❤️ Contributors

- Thomi Syauqi ([@thomiOmi](https://github.com/thomiOmi))

## v0.3.0

[compare changes](https://github.com/thomiOmi/agent-skills/compare/v0.2.2...v0.3.0)

### 🚀 Enhancements

- Add memory-management skill ([#23](https://github.com/thomiOmi/agent-skills/pull/23))

### 🩹 Fixes

- Remove overlapping skill triggers and add by-name pointers ([#25](https://github.com/thomiOmi/agent-skills/pull/25))

### 💅 Refactors

- Merge colliding skills into parent skills as references ([#26](https://github.com/thomiOmi/agent-skills/pull/26))

### 📖 Documentation

- Group skills by SDLC phase in README ([#24](https://github.com/thomiOmi/agent-skills/pull/24))

### ❤️ Contributors

- Thomi Syauqi ([@thomiOmi](https://github.com/thomiOmi))

## v0.2.2

[compare changes](https://github.com/thomiOmi/agent-skills/compare/v0.2.1...v0.2.2)

### 🚀 Enhancements

- Expand eval coverage to core skills with assertion grading ([9d122dc](https://github.com/thomiOmi/agent-skills/commit/9d122dc))
- Add compaction hook preserving TASKS.md state ([a16656d](https://github.com/thomiOmi/agent-skills/commit/a16656d))
- Add no-ai-slop skill for removing AI slop patterns from prose ([afa2601](https://github.com/thomiOmi/agent-skills/commit/afa2601))
- Add tool guard hooks and conventional git skills ([319b795](https://github.com/thomiOmi/agent-skills/commit/319b795))

### 🩹 Fixes

- **skills:** Repair broken references, mojibake, and unlisted reference files ([aa98fb8](https://github.com/thomiOmi/agent-skills/commit/aa98fb8))
- Fix bin path and repository url for npm publish ([d71bf2e](https://github.com/thomiOmi/agent-skills/commit/d71bf2e))

### 📖 Documentation

- Add agent skills audit report ([57b84b1](https://github.com/thomiOmi/agent-skills/commit/57b84b1))
- Record compaction plugin in TASKS.md change history ([108f027](https://github.com/thomiOmi/agent-skills/commit/108f027))
- Document skill permissions and MCP server config ([22f6d3f](https://github.com/thomiOmi/agent-skills/commit/22f6d3f))
- Document distribution status and local clone install path ([8aa1534](https://github.com/thomiOmi/agent-skills/commit/8aa1534))
- Document per-agent model overrides ([e426f03](https://github.com/thomiOmi/agent-skills/commit/e426f03))

### 🏡 Chore

- Fix double-space artifact and add missing checklists ([c6d597b](https://github.com/thomiOmi/agent-skills/commit/c6d597b))
- Tighten agent permissions per DECISIONS convention ([3b73301](https://github.com/thomiOmi/agent-skills/commit/3b73301))
- Add trust boundaries and session handoff guidance ([c647c45](https://github.com/thomiOmi/agent-skills/commit/c647c45))

### ❤️ Contributors

- Thomi Syauqi ([@thomiOmi](https://github.com/thomiOmi))

## v0.2.1

[compare changes](https://github.com/thomiOmi/agent-skills/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- Add researcher and project-manager agents with research-methodology skill ([c00678e](https://github.com/thomiOmi/agent-skills/commit/c00678e))
- Replace deploy/sync/symlink with single install command and add bunx bin entry ([67490f8](https://github.com/thomiOmi/agent-skills/commit/67490f8))
- Integrate unjs ecosystem into installer (c12, pkg-types, std-env, scule, ufo, giget) ([a6de03e](https://github.com/thomiOmi/agent-skills/commit/a6de03e))
- Add agentskills.io eval runner with workspace scaffold and validation test ([d0390d9](https://github.com/thomiOmi/agent-skills/commit/d0390d9))

### 📖 Documentation

- Fix skill and command counts in PRD and README ([6b36510](https://github.com/thomiOmi/agent-skills/commit/6b36510))
- Clear completed GitHub Actions item from roadmap Planned ([09aa862](https://github.com/thomiOmi/agent-skills/commit/09aa862))

### 🏡 Chore

- Add commitlint config for commit-msg hook ([6f88504](https://github.com/thomiOmi/agent-skills/commit/6f88504))
- Add commitlint config for commit-msg hook" ([9848173](https://github.com/thomiOmi/agent-skills/commit/9848173))

### 🤖 CI

- Add release workflow, concurrency, bun cache, and PR title validation ([841eb9d](https://github.com/thomiOmi/agent-skills/commit/841eb9d))
- Add commitlint, changelogen release tooling, and git hooks ([264ed86](https://github.com/thomiOmi/agent-skills/commit/264ed86))
- Drop pr-title job, commitlint covers commit convention ([655e57a](https://github.com/thomiOmi/agent-skills/commit/655e57a))

### ❤️ Contributors

- Thomi Syauqi ([@thomiOmi](https://github.com/thomiOmi))

## v0.2.0

### 🚀 Enhancements

- **config:** Add Mermaid, draw.io, Sequential Thinking MCP servers; clean up TUI config ([88c5c48](https://github.com/thomiOmi/agent-skills/commit/88c5c48))
- **orchestra:** Production-ready agent orchestra setup ([c4bbaef](https://github.com/thomiOmi/agent-skills/commit/c4bbaef))
- **installer:** Enhance deploy/sync/symlink CLI for target overrides and testing ([7948d46](https://github.com/thomiOmi/agent-skills/commit/7948d46))
- **installer:** Support opencode.json/opencode.jsonc and tui.json/tui.jsonc config resolution and deployment ([913735d](https://github.com/thomiOmi/agent-skills/commit/913735d))
- **installer:** Sync skills to ~/.agents/skills/ for OpenCode multi-location discovery ([f28eb08](https://github.com/thomiOmi/agent-skills/commit/f28eb08))
- **task-management:** Adopt file-based TASKS.md persistence and tracking ([0b594f8](https://github.com/thomiOmi/agent-skills/commit/0b594f8))
- **skills:** Verify and stabilize all 15 skills ([96994df](https://github.com/thomiOmi/agent-skills/commit/96994df))
- **spec:** Implement agentskills.io validation and evaluation guidelines ([ba09d58](https://github.com/thomiOmi/agent-skills/commit/ba09d58))
- **installer:** Support OPENCODE_CONFIG env var and opencode.json/opencode.jsonc discovery precedence ([fdabff2](https://github.com/thomiOmi/agent-skills/commit/fdabff2))
- **agents:** Add product-manager and data-analyst subagents with data-analysis skill ([6360ec3](https://github.com/thomiOmi/agent-skills/commit/6360ec3))
- **skills:** Enrich sdlc-documentation and planning skills with roadmap and research patterns ([f7260fd](https://github.com/thomiOmi/agent-skills/commit/f7260fd))
- **skills:** Add code-simplifier skill and commit slash commands ([47fe69a](https://github.com/thomiOmi/agent-skills/commit/47fe69a))
- Create dependabot.yml ([87633ec](https://github.com/thomiOmi/agent-skills/commit/87633ec))
- Add OPENCODE.md, update opencode config, and rename design-system to design-md ([41cd298](https://github.com/thomiOmi/agent-skills/commit/41cd298))
- Enhance skills with subdirectories and real-project file guidance ([9cb8eff](https://github.com/thomiOmi/agent-skills/commit/9cb8eff))
- Add reference templates for SPEC.md, DECISIONS.md, and ARCHITECTURE.md ([0df4ef7](https://github.com/thomiOmi/agent-skills/commit/0df4ef7))
- Audit and improve agent skills, prompt designs, and commands ([87d732c](https://github.com/thomiOmi/agent-skills/commit/87d732c))

### 🩹 Fixes

- **opencode:** Set default_agent to plan, add ESLint MCP, redirect memory to .opencode/ ([2e4df7d](https://github.com/thomiOmi/agent-skills/commit/2e4df7d))
- Update dependabot.yml ([ac71d7e](https://github.com/thomiOmi/agent-skills/commit/ac71d7e))

### 💅 Refactors

- **instructions:** Generalize agent rules and prompts to be tool-agnostic ([2903155](https://github.com/thomiOmi/agent-skills/commit/2903155))
- **skills:** Decompose skills into atomic, focused domain skills ([cf743f6](https://github.com/thomiOmi/agent-skills/commit/cf743f6))

### 📖 Documentation

- Add Development Skills section with find-skills and skill-creator ([923c13f](https://github.com/thomiOmi/agent-skills/commit/923c13f))
- **AGENTS.md:** Update global config deploy description ([19104e5](https://github.com/thomiOmi/agent-skills/commit/19104e5))
- **AGENTS.md:** Instruct agents to read context documents at start of session ([31e1a4b](https://github.com/thomiOmi/agent-skills/commit/31e1a4b))
- **prd,architecture:** Restore remember step in workflow for TASKS.md persistence ([bbb6037](https://github.com/thomiOmi/agent-skills/commit/bbb6037))

### 🏡 Chore

- Commit pre-setup state before config expansion ([7fbf6ce](https://github.com/thomiOmi/agent-skills/commit/7fbf6ce))
- Update ([222464c](https://github.com/thomiOmi/agent-skills/commit/222464c))
- Remove third-party MCP configs and update project documentation ([7ce114b](https://github.com/thomiOmi/agent-skills/commit/7ce114b))
- Update dependabot.yml ([2497b45](https://github.com/thomiOmi/agent-skills/commit/2497b45))

### 🤖 CI

- Add GitHub Actions workflow for linting, typechecking, and testing ([dfc3688](https://github.com/thomiOmi/agent-skills/commit/dfc3688))

### ❤️ Contributors

- Thomi Syauqi ([@thomiOmi](https://github.com/thomiOmi))

