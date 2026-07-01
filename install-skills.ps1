# install-skills.ps1
# Install AGENTS.md, SKILL.md files, and markdown agent definitions for OpenCode CLI.
# Also installs to ~/.agents/skills and ~/.agents/agents (universal path for OpenCode, Claude Code, Copilot)
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkillsOnly
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -AgentsOnly
#   powershell -ExecutionPolicy Bypass -File .\install-skills.ps1 -SkipAgents

param([switch]$SkillsOnly, [switch]$AgentsOnly, [switch]$SkipAgents)

$ErrorActionPreference = "Stop"

if ($AgentsOnly -and $SkipAgents) {
    throw "-AgentsOnly and -SkipAgents cannot be used together"
}

if ($AgentsOnly -and $SkillsOnly) {
    throw "-AgentsOnly and -SkillsOnly cannot be used together"
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsSrc = Join-Path $ScriptDir "skills"
$AgentsSrc = Join-Path $ScriptDir "agents"
$Skills = @("task-decomposition", "code-style", "api-conventions", "testing", "documentation", "planning", "debugging", "ai-integration", "sdlc-documentation", "git-workflow", "security-review", "database", "knowledge-management")
$OpenCodeDir = Join-Path $env:USERPROFILE ".config\opencode"
$OpenCodeSkills = Join-Path $OpenCodeDir "skills"
$OpenCodeAgents = Join-Path $OpenCodeDir "agents"
$UniversalSkills = Join-Path $env:USERPROFILE ".agents\skills"
$UniversalAgents = Join-Path $env:USERPROFILE ".agents\agents"

Write-Host "=== Agent Skills Installer ===" -ForegroundColor Cyan
if ($AgentsOnly) {
    Write-Host "Mode: agents only" -ForegroundColor DarkYellow
}
elseif ($SkillsOnly) {
    Write-Host "Mode: skills only" -ForegroundColor DarkYellow
}
elseif ($SkipAgents) {
    Write-Host "Mode: skills only (agents skipped)" -ForegroundColor DarkYellow
}
Write-Host ""

function Install-Skills {
    param([string]$TargetDir)

    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

    foreach ($skill in $Skills) {
        $src = Join-Path $SkillsSrc $skill
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

function Install-Agents {
    param([string]$TargetDir)

    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
    $agents = Get-ChildItem -Path $AgentsSrc -Filter *.md -File | Sort-Object Name

    if (-not $agents) {
        Write-Host "  WARN no agent markdown files found in agents/" -ForegroundColor DarkYellow
        Write-Host ("  -> " + $TargetDir) -ForegroundColor DarkGray
        return
    }

    $copied = 0
    foreach ($agent in $agents) {
        $destPath = Join-Path $TargetDir $agent.Name
        if (Test-Path $destPath) {
            Write-Host ("  SKIP " + $agent.Name + " - already exists")
            continue
        }

        Copy-Item $agent.FullName $destPath -Force
        $copied++
    }

    if ($copied -gt 0) {
        Write-Host ("  OK " + $copied + " agent definition(s) -> " + $TargetDir)
    }
    else {
        Write-Host ("  OK no new agent definition(s) -> " + $TargetDir)
    }
    Write-Host ("  -> " + $TargetDir) -ForegroundColor DarkGray
}

# OpenCode CLI
Write-Host "-> Installing for OpenCode CLI..." -ForegroundColor Yellow

if (-not $AgentsOnly) {
    if (-not $SkillsOnly) {
        New-Item -ItemType Directory -Force -Path $OpenCodeDir | Out-Null
        Copy-Item (Join-Path $ScriptDir "AGENTS.md")  (Join-Path $OpenCodeDir "AGENTS.md")  -Force
        Copy-Item (Join-Path $ScriptDir "INSTALL.md") (Join-Path $OpenCodeDir "INSTALL.md") -Force
        Write-Host ("  OK AGENTS.md  -> " + $OpenCodeDir + "\AGENTS.md")
        Write-Host ("  OK INSTALL.md -> " + $OpenCodeDir + "\INSTALL.md")
    }

    Install-Skills -TargetDir $OpenCodeSkills
}
else {
    Write-Host "  SKIP skills installation" -ForegroundColor DarkYellow
}

if (-not $SkipAgents) {
    Install-Agents -TargetDir $OpenCodeAgents
}
else {
    Write-Host "  SKIP agent installation" -ForegroundColor DarkYellow
}

if (-not $AgentsOnly -and -not $SkillsOnly) {
    $ConfigJsonc = Join-Path $OpenCodeDir "opencode.jsonc"
    $ConfigJson = Join-Path $OpenCodeDir "opencode.json"
    $agentsPath = ($env:USERPROFILE -replace '\\', '/') + "/.config/opencode/AGENTS.md"

    if (Test-Path $ConfigJsonc) {
        $content = Get-Content $ConfigJsonc -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.jsonc already has instructions - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        }
        else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', (",`n  ""instructions"": [""" + $agentsPath + """],`n  ""permission"": { ""skill"": { ""*"": ""allow"" } }`n}")
            Set-Content -Path $ConfigJsonc -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Updated opencode.jsonc"
        }
    }
    elseif (Test-Path $ConfigJson) {
        $content = Get-Content $ConfigJson -Raw
        if ($content -match '"instructions"') {
            Write-Host "  WARN opencode.json already has instructions - verify it includes AGENTS.md" -ForegroundColor DarkYellow
        }
        else {
            $injected = $content.TrimEnd() -replace '}(\s*)$', (",`n  ""instructions"": [""" + $agentsPath + """],`n  ""permission"": { ""skill"": { ""*"": ""allow"" } }`n}")
            Set-Content -Path $ConfigJson -Value $injected -Encoding UTF8 -NoNewline
            Write-Host "  OK Updated opencode.json"
        }
    }
    else {
        $jsonContent = "{\n  ""`$schema"": ""https://opencode.ai/config.json"",\n  ""instructions"": [""" + $agentsPath + """],\n  ""permission"": {\n    ""skill"": { ""*"": ""allow"" }\n  }\n}"
        Set-Content -Path $ConfigJsonc -Value $jsonContent -Encoding UTF8
        Write-Host "  OK Created opencode.jsonc"
    }
}

Write-Host ""

# Universal path
Write-Host "-> Installing to universal path..." -ForegroundColor Yellow
if (-not $AgentsOnly) {
    Install-Skills -TargetDir $UniversalSkills
}
else {
    Write-Host "  SKIP universal skills installation" -ForegroundColor DarkYellow
}

if (-not $SkipAgents) {
    Install-Agents -TargetDir $UniversalAgents
}
else {
    Write-Host "  SKIP universal agent installation" -ForegroundColor DarkYellow
}
Write-Host ""

# Knowledge file setup
if (-not $AgentsOnly) {
    Write-Host "-> Setting up knowledge files..." -ForegroundColor Yellow
    $GlobalKnowledge = Join-Path $env:USERPROFILE ".agents\KNOWLEDGE.md"
    $LegacyGlobalKnowledge = Join-Path $env:USERPROFILE ".agents\knowledge.md"
    $KnowledgeTemplate = [System.IO.Path]::Combine($UniversalSkills, "knowledge-management", "assets", "KNOWLEDGE.md.template")

    if (Test-Path $GlobalKnowledge) {
        Write-Host "  SKIP ~/.agents/KNOWLEDGE.md already exists - not overwritten" -ForegroundColor DarkGray
    }
    elseif (Test-Path $LegacyGlobalKnowledge) {
        Write-Host "  SKIP ~/.agents/knowledge.md already exists - not overwritten" -ForegroundColor DarkGray
    }
    elseif (Test-Path $KnowledgeTemplate) {
        Copy-Item $KnowledgeTemplate $GlobalKnowledge -Force
        Write-Host ("  OK Created ~/.agents/KNOWLEDGE.md from template")
    }
    else {
        Write-Host "  SKIP KNOWLEDGE.md template not found" -ForegroundColor DarkYellow
    }

    # Add global knowledge to opencode.jsonc instructions if not present
    $ConfigJsoncPath = Join-Path $OpenCodeDir "opencode.jsonc"
    $ConfigJsonPath = Join-Path $OpenCodeDir "opencode.json"
    $globalKnowledgePath = ($env:USERPROFILE -replace '\\', '/') + '/.agents/KNOWLEDGE.md'
    $agentsPath = ($env:USERPROFILE -replace '\\', '/') + '/.config/opencode/AGENTS.md'

    function Add-KnowledgeToConfig {
        param([string]$ConfigPath)
        $cfg = (Get-Content $ConfigPath -Raw).Replace('\', '/')

        if ($cfg -match '"instructions"') {
            $instructionBlock = '  "instructions": [' + [Environment]::NewLine +
            '    "' + $globalKnowledgePath + '",' + [Environment]::NewLine +
            '    "' + $agentsPath + '"' + [Environment]::NewLine +
            '  ],' + [Environment]::NewLine
            $cfg = [regex]::Replace($cfg, '(?ms)^\s*"instructions"\s*:\s*\[[^\]]*\]\s*,?\s*', $instructionBlock, 1)
            Set-Content -Path $ConfigPath -Value $cfg -Encoding UTF8 -NoNewline
            Write-Host ("  OK Added KNOWLEDGE.md to instructions in " + (Split-Path $ConfigPath -Leaf))
        }
        else {
            Write-Host "  WARN No instructions field found - add manually" -ForegroundColor DarkYellow
        }
    }

    if (Test-Path $ConfigJsoncPath) {
        Add-KnowledgeToConfig -ConfigPath $ConfigJsoncPath
    }
    elseif (Test-Path $ConfigJsonPath) {
        Add-KnowledgeToConfig -ConfigPath $ConfigJsonPath
    }
}

Write-Host ""

# Summary
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host ""
if (-not $AgentsOnly) {
    Write-Host "Skills installed:"
    foreach ($skill in $Skills) {
        Write-Host ("  * " + $skill)
    }
    Write-Host ""
}
Write-Host "Install locations:"
if (-not $AgentsOnly) {
    Write-Host ("  OpenCode CLI : " + $OpenCodeSkills)
    Write-Host ("  Universal    : " + $UniversalSkills)
}
Write-Host ("  OpenCode agents : " + $OpenCodeAgents)
Write-Host ("  Universal agents : " + $UniversalAgents)
Write-Host ""
Write-Host "Next steps:"
if ($SkillsOnly) {
    Write-Host "  1. AGENTS.md loaded remotely from GitHub - no action needed"
}
elseif (-not $AgentsOnly) {
    Write-Host ("  1. Verify: cat " + $OpenCodeDir + "\opencode.jsonc")
}
Write-Host "  2. Set provider: opencode providers"
if (-not $AgentsOnly) {
    Write-Host "  3. Per-project: run /init inside OpenCode to generate AGENTS.md"
}
else {
    Write-Host "  3. OpenCode will pick up markdown agents from ~/.config/opencode/agents"
}