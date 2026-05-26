# install-skills.ps1
# Install AGENTS.md and SKILL.md files for OpenCode CLI.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly

param([switch]$SkillsOnly)

$ErrorActionPreference = "Stop"

$ScriptDir      = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsSrc      = Join-Path $ScriptDir "skills"
$Skills         = @("task-decomposition","code-style","api-conventions","testing","documentation","planning","debugging","ai-integration")
$OpenCodeDir    = Join-Path $env:USERPROFILE ".config\opencode"
$OpenCodeSkills = Join-Path $OpenCodeDir "skills"

Write-Host "=== Agent Skills Installer ===" -ForegroundColor Cyan
if ($SkillsOnly) { Write-Host "Mode: skills only (AGENTS.md skipped)" -ForegroundColor DarkYellow }
Write-Host ""

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

if (-not $SkillsOnly) {
    $ConfigJsonc = Join-Path $OpenCodeDir "opencode.jsonc"
    $ConfigJson  = Join-Path $OpenCodeDir "opencode.json"
    $agentsPath  = ($env:USERPROFILE -replace '\\', '/') + "/.config/opencode/AGENTS.md"

    if (Test-Path $ConfigJsonc) {
        $content = Get-Content $ConfigJsonc -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.jsonc already has 'instructions' - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        } else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', ",`n  `"instructions`": [`"$agentsPath`"],`n  `"permission`": { `"skill`": { `"*`": `"allow`" } }`n}"
            Set-Content -Path $ConfigJsonc -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Updated opencode.jsonc"
        }
    } elseif (Test-Path $ConfigJson) {
        $content = Get-Content $ConfigJson -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.json already has 'instructions' - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        } else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', ",`n  `"instructions`": [`"$agentsPath`"],`n  `"permission`": { `"skill`": { `"*`": `"allow`" } }`n}"
            Set-Content -Path $ConfigJson -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Updated opencode.json"
        }
    } else {
        $json = "{`n  `"`$schema`": `"https://opencode.ai/config.json`",`n  `"instructions`": [`"$agentsPath`"],`n  `"permission`": {`n    `"skill`": { `"*`": `"allow`" }`n  }`n}"
        Set-Content -Path $ConfigJsonc -Value $json -Encoding UTF8
        Write-Host "  OK Created opencode.jsonc"
    }
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host ""
Write-Host "Skills installed:"
foreach ($skill in $Skills) { Write-Host "  * $skill" }
Write-Host ""
Write-Host "Next steps:"
if ($SkillsOnly) {
    Write-Host "  1. AGENTS.md loaded remotely from GitHub - no action needed"
} else {
    Write-Host "  1. Verify: cat $OpenCodeDir\opencode.jsonc"
}
Write-Host "  2. Set provider: opencode providers"
Write-Host "  3. Per-project: create AGENTS.md and fill in [Project Context]"
Write-Host "     Or run /init inside OpenCode to generate it automatically"