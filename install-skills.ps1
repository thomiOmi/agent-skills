# install-skills.ps1
# Install global AGENTS.md, SKILL.md files, and INSTALL.md.
# Works for: OpenCode CLI, Claude Code, Gemini CLI on Windows
#
# Usage:
#   .\install-skills.ps1
#
# If blocked by execution policy, run once:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsSrc = Join-Path $ScriptDir "skills"
$Skills    = @("task-decomposition", "code-style", "api-conventions", "testing", "documentation", "planning", "debugging", "ai-integration")

Write-Host "=== Agent Skills Installer ===" -ForegroundColor Cyan
Write-Host ""

# ── 1. OpenCode CLI ───────────────────────────────────────────────────────────
$OpenCodeDir    = Join-Path $env:USERPROFILE ".config\opencode"
$OpenCodeSkills = Join-Path $OpenCodeDir "skills"

Write-Host "-> Installing for OpenCode CLI..." -ForegroundColor Yellow
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

# ── Handle opencode.jsonc / opencode.json ────────────────────────────────────
# Detect which config file exists (prefer .jsonc if present)
$ConfigJsonc = Join-Path $OpenCodeDir "opencode.jsonc"
$ConfigJson  = Join-Path $OpenCodeDir "opencode.json"
$homePath    = $env:USERPROFILE -replace '\\', '/'
$agentsPath  = "$homePath/.config/opencode/AGENTS.md"

if (Test-Path $ConfigJsonc) {
    # .jsonc exists — read and merge instructions field
    $raw     = Get-Content $ConfigJsonc -Raw
    $content = $raw.Trim()

    if ($content -match '"instructions"') {
        # instructions already present — warn, don't overwrite
        Write-Host "  WARN opencode.jsonc already has 'instructions' field" -ForegroundColor DarkYellow
        Write-Host "       Manually verify it includes: $agentsPath"
    } else {
        # Inject instructions before the closing brace
        $injected = $content -replace '}(\s*)$', ",`n  `"instructions`": [`"$agentsPath`"]`n}`$1"
        Set-Content -Path $ConfigJsonc -Value $injected -Encoding UTF8 -NoNewline
        Write-Host "  OK Added 'instructions' to existing opencode.jsonc"
    }

} elseif (Test-Path $ConfigJson) {
    # .json exists — same merge logic
    $raw     = Get-Content $ConfigJson -Raw
    $content = $raw.Trim()

    if ($content -match '"instructions"') {
        Write-Host "  WARN opencode.json already has 'instructions' field" -ForegroundColor DarkYellow
        Write-Host "       Manually verify it includes: $agentsPath"
    } else {
        $injected = $content -replace '}(\s*)$', ",`n  `"instructions`": [`"$agentsPath`"]`n}`$1"
        Set-Content -Path $ConfigJson -Value $injected -Encoding UTF8 -NoNewline
        Write-Host "  OK Added 'instructions' to existing opencode.json"
    }

} else {
    # No config exists — create opencode.jsonc from scratch
    $jsonContent = @"
{
  "`$schema": "https://opencode.ai/config.json",
  "instructions": ["$agentsPath"]
}
"@
    Set-Content -Path $ConfigJsonc -Value $jsonContent -Encoding UTF8
    Write-Host "  OK Created opencode.jsonc"
    Write-Host "     -> Set your model via: opencode providers"
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
$GeminiDir = Join-Path $env:USERPROFILE ".config\gemini"

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
Write-Host "Install locations:"
Write-Host "  OpenCode CLI : $OpenCodeDir"
Write-Host "  Claude Code  : $ClaudeDir"
Write-Host "  Gemini CLI   : $GeminiDir"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Verify config: cat $OpenCodeDir\opencode.jsonc"
Write-Host "  2. Set provider if not set: opencode providers"
Write-Host "  3. Per-project: create AGENTS.md at project root, fill in [Project Context]"
Write-Host "  4. Test: cd to any project, run: opencode"