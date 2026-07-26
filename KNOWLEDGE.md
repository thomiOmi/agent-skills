# KNOWLEDGE.md

Project knowledge base. Read by agent at the start of every session.

**Agent instructions:**

- Read this file with the `read` tool at session start
- Append new entries when significant decisions are made — do not overwrite existing entries
- Do NOT add a Preferences section here — Preferences belong in ~/.agents/knowledge.md only
- Session History = summary of the session, not a copy of individual decisions
- Keep entries concise — 3 to 5 lines maximum per entry

---

**Project:** agent-skills
**Stack:** TypeScript · Bun · @opencode-ai/plugin
**Created:** 2026-07-25

---

## Decisions

### Primary sebagai orchestrator, bukan flat agents — 2026-07-25

**Decision:** Primary agent bertindak sebagai centralized orchestrator dengan verification loop — bukan flat agents yang dipanggil langsung.
**Reason:** User ingin orchestra agent dengan parallel/sub-agent dan verification loop, mirip pola `plan` + `build` tapi dengan kontrol penuh dari primary agent. Built-in OpenCode agents (`plan`, `build`, dll) terkadang tidak sesuai harapan untuk use case spesifik user.
**Alternatives rejected:** Flat agents (masing-masing dipanggil langsung) — kehilangan verification loop dan orchestration logic. Hanya menggunakan built-in agents — kurang fleksibel untuk non-coding dan complex tasks.
**Impact:** Semua request lewat primary. Subagents tidak punya `task` permission untuk mencegah circular delegation. Verification loop di-handle oleh QA engineer + prompt instructions.

### Agent selection: hardcoded routing di primary prompt — 2026-07-25

**Decision:** Mapping task → agent di-hardcode di prompt primary, bukan menggunakan custom tool `agent-selector`.
**Reason:** Kontrol penuh — user bisa tentuin agent mana yang ngerjain task apa. Model tidak salah milih. Untuk MVP lebih penting reliability daripada flexibility.
**Alternatives rejected:** Custom tool `agent-selector` — opaque, model bisa salah milih, maintenance tambahan.
**Impact:** Kalau jumlah agent > 15 atau task makin kompleks, bisa diubah ke dynamic selector.

### Quality verification: prompt + qa-engineer subagent — 2026-07-25

**Decision:** Verification loop menggunakan qa-engineer subagent dan prompt instructions — bukan custom tool `quality-verifier`.
**Reason:** Zero custom code untuk MVP. qa-engineer punya akses run test, typecheck, lint. Prompt instructions sebagai fallback guidance. Jika nanti sering gagal, custom tool bisa ditambah.
**Alternatives rejected:** Custom tool `quality-verifier` — perlu maintenance, rigid.
**Impact:** Verification loop ada di step 5 workflow primary prompt. qa-engineer dipanggil untuk verify hasil sebelum return ke user.

### Checkpoint: MCP Memory server (@modelcontextprotocol/server-memory) — 2026-07-25

**Decision:** Menggunakan MCP Memory server sebagai persistence layer untuk checkpoint task progress, bukan custom tool.
**Reason:** Zero custom code — tinggal config di opencode.jsonc, auto persist ke JSONL, searchable via `search_nodes`. Knowledge graph structure (entities + observations) cocok untuk task state.
**Alternatives rejected:** Custom tool `checkpoint.ts` — maintenance overhead. File-based JSON — tidak searchable, tidak terintegrasi dengan MCP.
**Impact:** Primary prompt harus describe checkpoint convention (entity name, type, observations). Agent cleanup via `delete_entities` setelah task selesai.

### Agent expansion: tunda sampai stabil — 2026-07-25

**Decision:** Fokus stabilisasi 11 agents yang ada sebelum menambah agent baru.
**Reason:** Quantity tanpa quality = reliability rendah. User setuju bahwa agents harus stabil dulu. Agent baru (researcher, project-manager, data-analyst, product-manager) akan ditambah sebagai iterasi berikutnya.
**Alternatives rejected:** Tambah semua agent sekarang — risiko prompt tidak konsisten, permissions salah, testing incomplete.
**Impact:** Iterasi berikutnya fokus ke stabilisasi, bukan quantity.

### 7 existing agents: frontmatter & permissions fix — 2026-07-25

**Decision:** Semua existing agents ditambahkan `name:` field, `skill: allow`, dan permissions yang sesuai standar OpenCode docs. Primary diubah `mode: "all"` → `mode: "primary"` dengan `doom_loop: allow`.
**Reason:** YAML frontmatter tidak lengkap — missing `name` field yang required oleh OpenCode spec. `skill: allow` diperlukan untuk agents yang load skills. Primary harus `mode: primary` karena orchestrator tidak boleh dipanggil sebagai subagent.
**Impact:** Config (`opencode.jsonc`) dan markdown files sekarang sync. Agents bisa di-deploy ke `~/.config/opencode/agents/`.

### 4 new agents: brainstormer, deep-thinker, docs-writer, refactor-planner — 2026-07-25

**Decision:** Created 4 new subagents untuk non-coding tasks dan specialized analysis.
**Reason:** Menutup gap untuk creative ideation (brainstormer, temp 0.8), complex reasoning (deep-thinker, temp 0.1), technical writing (docs-writer, temp 0.3), dan safe refactoring planning (refactor-planner, temp 0.2).
**Impact:** Total 11 agents (1 primary + 10 subagents). Masing-masing punya permission yang sesuai dengan perannya.

### Built-in OpenCode agents sebagai delegasi target — 2026-07-25

**Decision:** Built-in agents (`build`, `plan`, `general`, `explore`, `scout`) direferensi di primary prompt sebagai opsi delegasi ketika task cocok.
**Reason:** User kadang lebih suka hasil dari primary agent daripada built-in agents. Tapi built-in agents tetap berguna untuk specific use case (explore untuk fast search, scout untuk external research, plan untuk analysis, build untuk execution).
**Impact:** Primary prompt punya "Built-in Subagent Delegation" section. User explicit prefer primary over built-in untuk task umum.

---

## Conventions

### Checkpoint Convention

**Applies to:** Primary agent prompt + MCP Memory usage
**Rule:** Entity name = `checkpoint-{task_id}`, entity type = `checkpoint`, observations per step = `"step N: <description> — done"`, decisions = `"decision: <what>"`. Delete entity when task complete.
**Exception:** Simple tasks (< 3 steps) — no checkpoint needed.

### Agent Permission Convention

**Applies to:** All agent markdown files and opencode.jsonc
**Rule:** Setiap agent harus punya `read: allow` eksplisit. `edit: deny` dan `bash: deny` sebagai default aman untuk read-only agents. Hanya agents yang perlu nge-run test yang dikasih akses bash terbatas.
**Exception:** primary dan senior-developer — full bash access.

---

## Known Issues

| Issue | Location | Priority | Added | Status |
| --- | --- | --- | --- | --- |
| `build` agent tidak ada di prompt primary | agents/primary.md | Low | 2026-07-25 | Fixed |
| `quality-verifier` tool referenced tapi tidak ada | agents/primary.md:37 | Fixed | 2026-07-25 | Fixed |

---

## Session History

### 2026-07-27 — Global OpenCode daily productivity setup

**Done:**

- Created `global/` package (AGENTS.md, opencode.jsonc template, 10 commands)
- Added `scripts/deploy-global.ps1` — backup then full overwrite
- Added `scripts/sync-global.ps1` — incremental agents/skills only
- Deployed to `~/.config/opencode/` with backups at `~/.config/opencode-backups/`
- Full overwrite: 11 agents, 15 skills, 10 commands, global AGENTS.md
- MCP/LSP merged from previous config; removed global-only agents/skills (in backup)

**Decisions made:**

- Global-first setup (not per-project) for daily productivity
- Source of truth: `agents/`, `skills/`, `global/` in this repo
- Deploy path: full overwrite with automatic backup + MCP merge
- Previous custom agents (code-reviewer, laravel-simplifier) and skills (graphify, obsidian) live only in backup unless restored

**Remaining:**

- Move hardcoded MCP secrets to env vars / `{env:VAR}` (security hygiene)
- Optionally re-add graphify/obsidian as optional extras post-deploy
- Plugin auto-sync still a stub — deploy/sync scripts are the path for now

---

### 2026-07-25 — Agent audit, fix, new agents, knowledge management

**Done:**

- Audited all 7 existing agents (frontmatter, permissions)
- Fixed primary: mode "all" → "primary", added doom_loop
- Fixed all agents: added name field, skill:allow, read:allow
- Created 4 new agents: brainstormer, deep-thinker, docs-writer, refactor-planner
- Synced opencode.jsonc with all 11 agents
- Decided architecture: primary orchestrator with centralized coordination
- Decided verification: qa-engineer + prompt (no custom tool)
- Decided checkpoint: MCP Memory server (zero custom code)
- Decided agent selection: hardcoded routing in primary prompt
- Decided agent expansion: tunda sampai stabil
- Created KNOWLEDGE.md with all decisions

**Decisions made:**

- Primary sebagai orchestrator — see ## Decisions
- Agent selection: hardcoded routing — see ## Decisions
- Quality verification: prompt + qa-engineer — see ## Decisions
- Checkpoint: MCP Memory server — see ## Decisions
- Agent expansion: tunda — see ## Decisions
- 7 existing agents fix — see ## Decisions
- 4 new agents — see ## Decisions
- Built-in agents sebagai delegasi — see ## Decisions

**Remaining:**

- Agent expansion: researcher, project-manager, data-analyst, product-manager (next iteration)

---

## Update Log

- 2026-07-27: Global OpenCode deploy — backup + full overwrite via deploy-global.ps1, global/ package
- 2026-07-25: Initial project knowledge base created
