# install-skills.ps1
# Install AGENTS.md and SKILL.md files for OpenCode CLI.
# Also installs to ~/.agents/skills (universal path for OpenCode, Claude Code, Copilot)
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly

param([switch]$SkillsOnly)

$ErrorActionPreference = "Stop"

$ScriptDir       = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsSrc       = Join-Path $ScriptDir "skills"
$Skills          = @("task-decomposition","code-style","api-conventions","testing","documentation","planning","debugging","ai-integration","sdlc-documentation")
$OpenCodeDir     = Join-Path $env:USERPROFILE ".config\opencode"
$OpenCodeSkills  = Join-Path $OpenCodeDir "skills"
$UniversalSkills = Join-Path $env:USERPROFILE ".agents\skills"

Write-Host "=== Agent Skills Installer ===" -ForegroundColor Cyan
if ($SkillsOnly) {
    Write-Host "Mode: skills only" -ForegroundColor DarkYellow
}
Write-Host ""

function Install-Skills {
    param([string]$TargetDir)

    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

    foreach ($skill in $Skills) {
        $src  = Join-Path $SkillsSrc $skill
        $dest = Join-Path $TargetDir $skill

        if (-not (Test-Path $src)) {
            Write-Host "  SKIP $skill - not found in skills/" -ForegroundColor DarkYellow
            continue
        }

        if (Test-Path $dest) {
            Remove-Item $dest -Recurse -Force
        }
        Copy-Item $src $dest -Recurse -Force

        $refDir = Join-Path $dest "references"
        $refCount = 0
        if (Test-Path $refDir) {
            $refCount = (Get-ChildItem $refDir | Measure-Object).Count
        }
        $msg = "  OK " + $skill + " - " + $refCount + " references"
        Write-Host $msg
    }

    Write-Host ("  -> " + $TargetDir) -ForegroundColor DarkGray
}

# OpenCode CLI
Write-Host "-> Installing for OpenCode CLI..." -ForegroundColor Yellow

if (-not $SkillsOnly) {
    New-Item -ItemType Directory -Force -Path $OpenCodeDir | Out-Null
    Copy-Item (Join-Path $ScriptDir "AGENTS.md")  (Join-Path $OpenCodeDir "AGENTS.md")  -Force
    Copy-Item (Join-Path $ScriptDir "INSTALL.md") (Join-Path $OpenCodeDir "INSTALL.md") -Force
    Write-Host ("  OK AGENTS.md  -> " + $OpenCodeDir + "\AGENTS.md")
    Write-Host ("  OK INSTALL.md -> " + $OpenCodeDir + "\INSTALL.md")
}

Install-Skills -TargetDir $OpenCodeSkills

if (-not $SkillsOnly) {
    $ConfigJsonc = Join-Path $OpenCodeDir "opencode.jsonc"
    $ConfigJson  = Join-Path $OpenCodeDir "opencode.json"
    $agentsPath  = ($env:USERPROFILE -replace '\\', '/') + "/.config/opencode/AGENTS.md"

    if (Test-Path $ConfigJsonc) {
        $content = Get-Content $ConfigJsonc -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.jsonc already has instructions - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        } else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', (",`n  ""instructions"": [""" + $agentsPath + """],`n  ""permission"": { ""skill"": { ""*"": ""allow"" } }`n}")
            Set-Content -Path $ConfigJsonc -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Updated opencode.jsonc"
        }
    } elseif (Test-Path $ConfigJson) {
        $content = Get-Content $ConfigJson -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.json already has instructions - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        } else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', (",`n  ""instructions"": [""" + $agentsPath + """],`n  ""permission"": { ""skill"": { ""*"": ""allow"" } }`n}")
            Set-Content -Path $ConfigJson -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Updated opencode.json"
        }
    } else {
        $jsonContent = "{\n  ""`$schema"": ""https://opencode.ai/config.json"",\n  ""instructions"": [""" + $agentsPath + """],\n  ""permission"": {\n    ""skill"": { ""*"": ""allow"" }\n  }\n}"
        Set-Content -Path $ConfigJsonc -Value $jsonContent -Encoding UTF8
        Write-Host "  OK Created opencode.jsonc"
    }
}

Write-Host ""

# Universal path
Write-Host "-> Installing to universal path..." -ForegroundColor Yellow
Install-Skills -TargetDir $UniversalSkills
Write-Host ""

# Summary
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host ""
Write-Host "Skills installed:"
foreach ($skill in $Skills) {
    Write-Host ("  * " + $skill)
}
Write-Host ""
Write-Host "Install locations:"
Write-Host ("  OpenCode CLI : " + $OpenCodeSkills)
Write-Host ("  Universal    : " + $UniversalSkills)
Write-Host ""
Write-Host "Next steps:"
if ($SkillsOnly) {
    Write-Host "  1. AGENTS.md loaded remotely from GitHub - no action needed"
} else {
    Write-Host ("  1. Verify: cat " + $OpenCodeDir + "\opencode.jsonc")
}
Write-Host "  2. Set provider: opencode providers"
Write-Host "  3. Per-project: run /init inside OpenCode to generate AGENTS.md"