# install-skills.ps1
# Install global AGENTS.md, SKILL.md files, and INSTALL.md.
# Works for: OpenCode, Claude Code, Gemini CLI on Windows
#
# Usage:
#   .\install-skills.ps1
#
# If blocked by execution policy, run once:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

$ErrorActionPreference = "Stop"

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsSrc  = Join-Path $ScriptDir "skills"
$Skills     = @("task-decomposition", "code-style", "api-conventions", "testing", "documentation")

Write-Host "=== Agent Skills Installer ===" -ForegroundColor Cyan
Write-Host ""

# ── 1. OpenCode ───────────────────────────────────────────────────────────────
$OpenCodeDir    = Join-Path $env:APPDATA "opencode"
$OpenCodeSkills = Join-Path $OpenCodeDir "skills"

Write-Host "-> Installing for OpenCode..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $OpenCodeSkills | Out-Null

Copy-Item (Join-Path $ScriptDir "AGENTS.md")  (Join-Path $OpenCodeDir "AGENTS.md")  -Force
Copy-Item (Join-Path $ScriptDir "INSTALL.md") (Join-Path $OpenCodeDir "INSTALL.md") -Force

foreach ($skill in $Skills) {
    $dest = Join-Path $OpenCodeSkills $skill
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item (Join-Path $SkillsSrc "$skill\SKILL.md") (Join-Path $dest "SKILL.md") -Force
}

Write-Host "  OK AGENTS.md  -> $OpenCodeDir\AGENTS.md"
Write-Host "  OK INSTALL.md -> $OpenCodeDir\INSTALL.md"
Write-Host "  OK Skills     -> $OpenCodeSkills\"

$OpenCodeJson = Join-Path $OpenCodeDir "opencode.json"
if (-not (Test-Path $OpenCodeJson)) {
    $jsonContent = @'
{
  "model": "anthropic/claude-sonnet-4-5",
  "instructions": ["$APPDATA/opencode/AGENTS.md"],
  "permission": {
    "ask": "ask"
  }
}
'@
    Set-Content -Path $OpenCodeJson -Value $jsonContent -Encoding UTF8
    Write-Host "  OK Created opencode.json (add MCP servers as needed - see INSTALL.md)"
} else {
    Write-Host "  WARN opencode.json exists - verify 'instructions' includes AGENTS.md" -ForegroundColor DarkYellow
}

Write-Host ""

# ── 2. Claude Code ────────────────────────────────────────────────────────────
$ClaudeDir    = Join-Path $env:USERPROFILE ".claude"
$ClaudeSkills = Join-Path $ClaudeDir "skills"

Write-Host "-> Installing for Claude Code..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ClaudeSkills | Out-Null
Copy-Item (Join-Path $ScriptDir "AGENTS.md") (Join-Path $ClaudeDir "AGENTS.md") -Force

foreach ($skill in $Skills) {
    $dest = Join-Path $ClaudeSkills $skill
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item (Join-Path $SkillsSrc "$skill\SKILL.md") (Join-Path $dest "SKILL.md") -Force
}

Write-Host "  OK AGENTS.md -> $ClaudeDir\AGENTS.md"
Write-Host "  OK Skills    -> $ClaudeSkills\"
Write-Host ""

# ── 3. Gemini CLI ─────────────────────────────────────────────────────────────
$GeminiDir = Join-Path $env:APPDATA "gemini"

Write-Host "-> Installing for Gemini CLI..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $GeminiDir | Out-Null
Copy-Item (Join-Path $ScriptDir "AGENTS.md") (Join-Path $GeminiDir "AGENTS.md") -Force
Write-Host "  OK AGENTS.md -> $GeminiDir\AGENTS.md"
Write-Host ""

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host ""
Write-Host "Skills installed:"
foreach ($skill in $Skills) {
    Write-Host "  * $skill"
}
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit $OpenCodeDir\opencode.json to add your model and MCP servers"
Write-Host "     (see INSTALL.md for the full template)"
Write-Host "  2. Per-project: create AGENTS.md at project root, fill in [Project Context]"
Write-Host "  3. For WSL: run install-skills.sh inside WSL instead"
