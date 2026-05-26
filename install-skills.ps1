# install-skills.ps1
# Install AGENTS.md, SKILL.md files, and INSTALL.md globally.
# Works for: OpenCode CLI, Claude Code, Gemini CLI on Windows
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly
#     SkillsOnly: install skills only, skip AGENTS.md
#                 use when AGENTS.md is loaded remotely from GitHub

param(
    [switch]$SkillsOnly
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsSrc = Join-Path $ScriptDir "skills"
$Skills    = @("task-decomposition", "code-style", "api-conventions", "testing", "documentation", "planning", "debugging", "ai-integration")

Write-Host "=== Agent Skills Installer ===" -ForegroundColor Cyan
if ($SkillsOnly) { Write-Host "Mode: skills only (AGENTS.md skipped)" -ForegroundColor DarkYellow }
Write-Host ""

# ── 1. OpenCode CLI ───────────────────────────────────────────────────────────
# OpenCode CLI reads from ~/.config/opencode/ on all platforms
$OpenCodeDir    = Join-Path $env:USERPROFILE ".config\opencode"
$OpenCodeSkills = Join-Path $OpenCodeDir "skills"

Write-Host "-> Installing for OpenCode CLI..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $OpenCodeSkills | Out-Null

if (-not $SkillsOnly) {
    Copy-Item (Join-Path $ScriptDir "AGENTS.md")  (Join-Path $OpenCodeDir "AGENTS.md")  -Force
    Copy-Item (Join-Path $ScriptDir "INSTALL.md") (Join-Path $OpenCodeDir "INSTALL.md") -Force
    Write-Host "  OK AGENTS.md  -> $OpenCodeDir\AGENTS.md"
    Write-Host "  OK INSTALL.md -> $OpenCodeDir\INSTALL.md"
}

foreach ($skill in $Skills) {
    $dest = Join-Path $OpenCodeSkills $skill
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item (Join-Path $SkillsSrc "$skill\SKILL.md") (Join-Path $dest "SKILL.md") -Force
}
Write-Host "  OK Skills -> $OpenCodeSkills\"

# Handle opencode.jsonc / opencode.json
if (-not $SkillsOnly) {
    $ConfigJsonc = Join-Path $OpenCodeDir "opencode.jsonc"
    $ConfigJson  = Join-Path $OpenCodeDir "opencode.json"
    $homePath    = $env:USERPROFILE -replace '\\', '/'
    $agentsPath  = "$homePath/.config/opencode/AGENTS.md"

    if (Test-Path $ConfigJsonc) {
        $content = Get-Content $ConfigJsonc -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.jsonc already has 'instructions' - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        } else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', ",`n  `"instructions`": [`"$agentsPath`"],`n  `"permission`": { `"skill`": { `"*`": `"allow`" } }`n}"
            Set-Content -Path $ConfigJsonc -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Added 'instructions' + skill permissions to opencode.jsonc"
        }
    } elseif (Test-Path $ConfigJson) {
        $content = Get-Content $ConfigJson -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.json already has 'instructions' - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        } else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', ",`n  `"instructions`": [`"$agentsPath`"],`n  `"permission`": { `"skill`": { `"*`": `"allow`" } }`n}"
            Set-Content -Path $ConfigJson -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Added 'instructions' + skill permissions to opencode.json"
        }
    } else {
        $jsonContent = @"
{
  "`$schema": "https://opencode.ai/config.json",
  "instructions": ["$agentsPath"],
  "permission": {
    "skill": {
      "*": "allow"
    }
  }
}
"@
        Set-Content -Path $ConfigJsonc -Value $jsonContent -Encoding UTF8
        Write-Host "  OK Created opencode.jsonc"
    }
}

Write-Host ""

# ── 2. Claude Code ────────────────────────────────────────────────────────────
$ClaudeDir    = Join-Path $env:USERPROFILE ".claude"
$ClaudeSkills = Join-Path $ClaudeDir "skills"

Write-Host "-> Installing for Claude Code..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ClaudeSkills | Out-Null

if (-not $SkillsOnly) {
    Copy-Item (Join-Path $ScriptDir "AGENTS.md") (Join-Path $ClaudeDir "AGENTS.md") -Force
    Write-Host "  OK AGENTS.md -> $ClaudeDir\AGENTS.md"
}

foreach ($skill in $Skills) {
    $dest = Join-Path $ClaudeSkills $skill
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item (Join-Path $SkillsSrc "$skill\SKILL.md") (Join-Path $dest "SKILL.md") -Force
}
Write-Host "  OK Skills -> $ClaudeSkills\"
Write-Host ""

# ── 3. Gemini CLI ─────────────────────────────────────────────────────────────
$GeminiDir = Join-Path $env:USERPROFILE ".config\gemini"

Write-Host "-> Installing for Gemini CLI..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $GeminiDir | Out-Null

if (-not $SkillsOnly) {
    Copy-Item (Join-Path $ScriptDir "AGENTS.md") (Join-Path $GeminiDir "AGENTS.md") -Force
    Write-Host "  OK AGENTS.md -> $GeminiDir\AGENTS.md"
}
Write-Host ""

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host ""
Write-Host "Skills installed:"
foreach ($skill in $Skills) { Write-Host "  * $skill" }
Write-Host ""
Write-Host "Next steps:"
if ($SkillsOnly) {
    Write-Host "  1. AGENTS.md is loaded remotely from GitHub - no action needed"
} else {
    Write-Host "  1. Verify config: cat $OpenCodeDir\opencode.jsonc"
}
Write-Host "  2. Set provider if not set: opencode providers"
Write-Host "  3. Per-project: create AGENTS.md at project root, fill in [Project Context]"
Write-Host "     Or run /init inside OpenCode to generate it automatically"
Write-Host "  4. Test: cd to any project, run: opencode"