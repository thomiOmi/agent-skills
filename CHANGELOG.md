# Changelog


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

