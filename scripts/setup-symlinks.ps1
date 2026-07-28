#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Install agent-skills via symbolic links into the global OpenCode config.

.DESCRIPTION
  Creates symlinks from this repo into ~/.config/opencode/ so changes
  are instantly reflected — no re-deploy needed.

  Symlinks are created for:
    agents/*.md    → ~/.config/opencode/agents/
    skills/*/      → ~/.config/opencode/skills/
    tools/*.ts     → ~/.config/opencode/tools/
    commands/*.md  → ~/.config/opencode/commands/
    AGENTS.md      → ~/.config/opencode/AGENTS.md

  Falls back to copy if symlinks cannot be created
  (requires Admin/Developer Mode on Windows).

.PARAMETER DryRun
  Show actions without writing.

.EXAMPLE
  pwsh ./scripts/setup-symlinks.ps1
  pwsh ./scripts/setup-symlinks.ps1 -DryRun
#>
param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dstRoot = Join-Path $env:USERPROFILE ".config\opencode"
$backupRoot = Join-Path $env:USERPROFILE ".config\opencode-backups"

$subdirs = @{
  agents   = (Join-Path $repoRoot "agents")
  skills   = (Join-Path $repoRoot "skills")
  tools    = (Join-Path $repoRoot "tools")
  commands = (Join-Path $repoRoot "commands")
}

$files = @{
  AGENTS.md = (Join-Path $repoRoot "AGENTS.md")
}

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path $Path)) {
    if ($DryRun) {
      Write-Host "  [dry-run] mkdir $Path"
    } else {
      New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
  }
}

function Can-CreateSymlinks {
  # Test if the current user can create symlinks
  # On Windows: Developer Mode or Admin required
  # On non-Windows: always allowed
  if ($IsWindows) {
    try {
      $null = New-Item -ItemType SymbolicLink -Path "$env:TEMP\opencode-symlink-test" -Target "$env:TEMP" -Force -ErrorAction Stop
      Remove-Item "$env:TEMP\opencode-symlink-test" -Force -ErrorAction SilentlyContinue
      return $true
    } catch {
      return $false
    }
  }
  return $true
}

function New-SafeLink([string]$Path, [string]$Target, [string]$Label) {
  if ($DryRun) {
    Write-Host "  [dry-run] symlink $Label → $Target"
    return
  }
  # Remove existing file/dir/link at destination
  if (Test-Path $Path) {
    Remove-Item $Path -Recurse -Force -ErrorAction SilentlyContinue
  }
  try {
    New-Item -ItemType SymbolicLink -Path $Path -Target $Target -Force | Out-Null
    Write-Host "  symlink $Label"
  } catch {
    Write-Host "  symlink failed for $Label — copying instead" -ForegroundColor Yellow
    if (Test-Path $Target -PathType Container) {
      Copy-Item $Target $Path -Recurse -Force
    } else {
      Copy-Item $Target $Path -Force
    }
    Write-Host "  copy $Label"
  }
}

# --- Validate repo sources ---
foreach ($key in $subdirs.Keys) {
  if (-not (Test-Path $subdirs[$key])) {
    throw "Missing source directory: $($subdirs[$key])"
  }
}
foreach ($key in $files.Keys) {
  if (-not (Test-Path $files[$key])) {
    throw "Missing source file: $($files[$key])"
  }
}

Write-Host "Repo:   $repoRoot"
Write-Host "Global: $dstRoot"
if ($DryRun) { Write-Host "Mode:   DRY RUN" -ForegroundColor Yellow }

# --- Check symlink capability ---
$useSymlinks = Can-CreateSymlinks
if ($useSymlinks) {
  Write-Host "Symlinks: available" -ForegroundColor Green
} else {
  Write-Host "Symlinks: NOT available — falling back to copy" -ForegroundColor Yellow
}

Ensure-Dir $dstRoot

# --- 1. Backup ---
Write-Step "Backing up current global config"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$activeBackup = Join-Path $backupRoot $stamp

if ($DryRun) {
  Write-Host "  [dry-run] backup → $activeBackup"
} else {
  Ensure-Dir $backupRoot
  Ensure-Dir $activeBackup
  if (Test-Path $dstRoot) {
    & robocopy $dstRoot $activeBackup /E /XD node_modules /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "Backup robocopy failed: exit $LASTEXITCODE" }
  }
  $manifest = @"
# OpenCode Global Config Backup
Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Source: $dstRoot
Backup: $activeBackup
Excluded: node_modules

## Restore
``````powershell
`$backup = '$activeBackup'
`$dst = '$dstRoot'
robocopy `$backup `$dst /E
``````
"@
  Set-Content -Path (Join-Path $activeBackup "BACKUP.md") -Value $manifest -Encoding UTF8
  Write-Host "  Backup saved: $activeBackup"
}

# --- 2. Link agents ---
Write-Step "Linking agents"
$agentsDst = Join-Path $dstRoot "agents"
Ensure-Dir $agentsDst
Get-ChildItem (Join-Path $repoRoot "agents") -Filter "*.md" | ForEach-Object {
  $linkPath = Join-Path $agentsDst $_.Name
  if ($useSymlinks) {
    New-SafeLink -Path $linkPath -Target $_.FullName -Label "agent/$($_.Name)"
  } else {
    if ($DryRun) {
      Write-Host "  [dry-run] copy agent $($_.Name)"
    } else {
      Copy-Item $_.FullName $linkPath -Force
      Write-Host "  copy agent $($_.Name)"
    }
  }
}

# --- 3. Link skills ---
Write-Step "Linking skills"
$skillsDst = Join-Path $dstRoot "skills"
Ensure-Dir $skillsDst
Get-ChildItem (Join-Path $repoRoot "skills") -Directory | ForEach-Object {
  $linkPath = Join-Path $skillsDst $_.Name
  if ($useSymlinks) {
    New-SafeLink -Path $linkPath -Target $_.FullName -Label "skill/$($_.Name)"
  } else {
    if ($DryRun) {
      Write-Host "  [dry-run] copy skill $($_.Name)"
    } else {
      if (Test-Path $linkPath) { Remove-Item $linkPath -Recurse -Force }
      Copy-Item $_.FullName $linkPath -Recurse -Force
      Write-Host "  copy skill $($_.Name)"
    }
  }
}

# --- 4. Link tools ---
Write-Step "Linking tools"
$toolsDst = Join-Path $dstRoot "tools"
Ensure-Dir $toolsDst
Get-ChildItem (Join-Path $repoRoot "tools") -Filter "*.ts" | ForEach-Object {
  $linkPath = Join-Path $toolsDst $_.Name
  if ($useSymlinks) {
    New-SafeLink -Path $linkPath -Target $_.FullName -Label "tool/$($_.Name)"
  } else {
    if ($DryRun) {
      Write-Host "  [dry-run] copy tool $($_.Name)"
    } else {
      Copy-Item $_.FullName $linkPath -Force
      Write-Host "  copy tool $($_.Name)"
    }
  }
}

# --- 5. Link commands ---
Write-Step "Linking commands"
$commandsDst = Join-Path $dstRoot "commands"
Ensure-Dir $commandsDst
Get-ChildItem (Join-Path $repoRoot "commands") -Filter "*.md" | ForEach-Object {
  $linkPath = Join-Path $commandsDst $_.Name
  if ($useSymlinks) {
    New-SafeLink -Path $linkPath -Target $_.FullName -Label "command/$($_.Name)"
  } else {
    if ($DryRun) {
      Write-Host "  [dry-run] copy command $($_.Name)"
    } else {
      Copy-Item $_.FullName $linkPath -Force
      Write-Host "  copy command $($_.Name)"
    }
  }
}

# --- 6. Link AGENTS.md ---
Write-Step "Linking AGENTS.md"
$agentsMdDst = Join-Path $dstRoot "AGENTS.md"
if ($useSymlinks) {
  New-SafeLink -Path $agentsMdDst -Target (Join-Path $repoRoot "AGENTS.md") -Label "AGENTS.md"
} else {
  if ($DryRun) {
    Write-Host "  [dry-run] copy AGENTS.md"
  } else {
    Copy-Item (Join-Path $repoRoot "AGENTS.md") $agentsMdDst -Force
    Write-Host "  copy AGENTS.md"
  }
}

# --- 7. Write opencode.jsonc (merge MCP/LSP from previous config) ---
# Reuse the same merge logic as deploy-global.ps1
Write-Step "Writing opencode.jsonc (merge MCP/LSP from previous config)"

function Parse-Jsonc([string]$Path) {
  $raw = Get-Content -Path $Path -Raw -Encoding UTF8
  $raw = [regex]::Replace($raw, '(?m)^\s*//.*$', '')
  $raw = [regex]::Replace($raw, '/\*[\s\S]*?\*/', '')
  $raw = [regex]::Replace($raw, ',\s*([}\]])', '$1')
  return ($raw | ConvertFrom-Json)
}

function ConvertTo-JsoncPretty($Object) {
  return ($Object | ConvertTo-Json -Depth 30)
}

$homePosix = ($env:USERPROFILE -replace '\\', '/')
$instructionsPath = "$homePosix/.config/opencode/AGENTS.md"

$newCfg = [ordered]@{
  '$schema'        = "https://opencode.ai/config.json"
  default_agent    = "primary"
  shell            = "pwsh"
  subagent_depth   = 1
  small_model      = "opencode/deepseek-v4-flash-free"
  permission       = [ordered]@{
    skill      = "allow"
    lsp        = "allow"
    question   = "allow"
    todowrite  = "allow"
    doom_loop  = "allow"
  }
  instructions     = @($instructionsPath)
}

# Merge from previous config
$mergeCfgPath = Join-Path $dstRoot "opencode.jsonc"
if (-not (Test-Path $mergeCfgPath)) {
  $candidate = Join-Path $activeBackup "opencode.jsonc"
  if (Test-Path $candidate) { $mergeCfgPath = $candidate }
}

if (Test-Path $mergeCfgPath) {
  try {
    $old = Parse-Jsonc $mergeCfgPath
    if ($old.small_model) { $newCfg.small_model = $old.small_model }
    if ($old.lsp) { $newCfg.lsp = $old.lsp }
    if ($old.mcp) {
      $newCfg.mcp = $old.mcp
      $mcpNames = @($old.mcp.PSObject.Properties.Name) -join ", "
      Write-Host "  merged MCP servers: $mcpNames"
    }
    if ($old.model) { $newCfg.model = $old.model }
    Write-Host "  merge source: $mergeCfgPath"
  } catch {
    Write-Host "  warning: could not parse previous config for merge: $_" -ForegroundColor Yellow
  }
} else {
  Write-Host "  no previous config to merge — clean template only"
  $newCfg.mcp = [ordered]@{}
}

# Preserve tui.json from backup if missing
$tuiDst = Join-Path $dstRoot "tui.json"
$tuiBackup = Join-Path $activeBackup "tui.json"
if (-not (Test-Path $tuiDst) -and (Test-Path $tuiBackup)) {
  if (-not $DryRun) { Copy-Item $tuiBackup $tuiDst -Force }
  Write-Host "  restored tui.json from backup"
}

$cfgDst = Join-Path $dstRoot "opencode.jsonc"
if ($DryRun) {
  Write-Host "  [dry-run] would write $cfgDst"
} else {
  $json = ConvertTo-JsoncPretty $newCfg
  $banner = @"
// OpenCode global config — deployed from agent-skills
// Backup: $activeBackup
// Deployed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
// MCP/LSP merged from previous config when available.

"@
  Set-Content -Path $cfgDst -Value ($banner + $json) -Encoding UTF8
  Write-Host "  ok  opencode.jsonc"
}

# --- 8. Summary ---
Write-Step "Done"
Write-Host "Backup:  $activeBackup"
Write-Host ""
if ($useSymlinks) {
  Write-Host "Symlinks created — edit files in $repoRoot and changes are live." -ForegroundColor Green
} else {
  Write-Host "Files copied — run this script again after pulling changes." -ForegroundColor Yellow
}
Write-Host "Restart OpenCode (or open a new session) to load the new global setup."
Write-Host ""
Write-Host "Restore previous global config:" -ForegroundColor Yellow
Write-Host "  robocopy `"$activeBackup`" `"$dstRoot`" /E"