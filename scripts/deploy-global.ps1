#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Backup then fully overwrite the global OpenCode config from this repo.

.DESCRIPTION
  1. Full backup of ~/.config/opencode → ~/.config/opencode-backups/<timestamp>
  2. Overwrite agents, skills, commands, AGENTS.md from this repo
  3. Write opencode.jsonc from global/ template, merging MCP + LSP from the
     previous config so existing servers/tokens keep working
  4. Preserve tui.json and package.json if present

.PARAMETER SkipBackup
  Skip backup (only if you already backed up).

.PARAMETER BackupPath
  Use an existing backup directory as the merge source for MCP/LSP
  instead of the live config (useful for re-deploy).

.PARAMETER DryRun
  Show actions without writing.

.EXAMPLE
  pwsh ./scripts/deploy-global.ps1
  pwsh ./scripts/deploy-global.ps1 -DryRun
#>
param(
  [switch]$SkipBackup,
  [string]$BackupPath,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$globalSrc = Join-Path $repoRoot "global"
$agentsSrc = Join-Path $repoRoot "agents"
$skillsSrc = Join-Path $repoRoot "skills"
$toolsSrc = Join-Path $repoRoot "tools"
$commandsSrc = Join-Path $globalSrc "commands"
$agentsMdSrc = Join-Path $globalSrc "AGENTS.md"
$templateCfg = Join-Path $globalSrc "opencode.jsonc"

$dstRoot = Join-Path $env:USERPROFILE ".config\opencode"
$backupRoot = Join-Path $env:USERPROFILE ".config\opencode-backups"

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path $Path)) {
    if ($DryRun) {
      Write-Host "  [dry-run] mkdir $Path"
    }
    else {
      New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
  }
}

function Parse-Jsonc([string]$Path) {
  $raw = Get-Content -Path $Path -Raw -Encoding UTF8
  # Strip // line comments and /* */ blocks (best-effort for our configs)
  $raw = [regex]::Replace($raw, '(?m)^\s*//.*$', '')
  $raw = [regex]::Replace($raw, '/\*[\s\S]*?\*/', '')
  $raw = [regex]::Replace($raw, ',\s*([}\]])', '$1')
  return ($raw | ConvertFrom-Json)
}

function ConvertTo-JsoncPretty($Object) {
  # PowerShell ConvertTo-Json; depth high enough for MCP trees
  return ($Object | ConvertTo-Json -Depth 30)
}

# --- Validate sources ---
foreach ($p in @($agentsSrc, $skillsSrc, $commandsSrc, $agentsMdSrc, $templateCfg)) {
  if (-not (Test-Path $p)) { throw "Missing source: $p" }
}

Write-Host "Repo:   $repoRoot"
Write-Host "Global: $dstRoot"
if ($DryRun) { Write-Host "Mode:   DRY RUN" -ForegroundColor Yellow }

Ensure-Dir $dstRoot

# --- 1. Backup ---
$activeBackup = $BackupPath
if (-not $SkipBackup) {
  Write-Step "Backing up current global config"
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $activeBackup = Join-Path $backupRoot $stamp
  if ($DryRun) {
    Write-Host "  [dry-run] backup → $activeBackup"
  }
  else {
    Ensure-Dir $backupRoot
    Ensure-Dir $activeBackup
    if (Test-Path $dstRoot) {
      # Exclude node_modules — reinstallable
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
}
elseif ($BackupPath) {
  Write-Step "Using existing backup for MCP merge: $BackupPath"
  if (-not (Test-Path $BackupPath)) { throw "BackupPath not found: $BackupPath" }
  $activeBackup = $BackupPath
}
else {
  Write-Step "SkipBackup set — no new backup"
}

# Merge source for MCP/LSP: live config if exists, else backup
$mergeCfgPath = Join-Path $dstRoot "opencode.jsonc"
if (-not (Test-Path $mergeCfgPath) -and $activeBackup) {
  $candidate = Join-Path $activeBackup "opencode.jsonc"
  if (Test-Path $candidate) { $mergeCfgPath = $candidate }
}

# --- 2. Overwrite agents ---
Write-Step "Overwriting agents"
$agentsDst = Join-Path $dstRoot "agents"
if (-not $DryRun) {
  if (Test-Path $agentsDst) { Remove-Item $agentsDst -Recurse -Force }
  Ensure-Dir $agentsDst
  Copy-Item (Join-Path $agentsSrc "*.md") $agentsDst -Force
}
Get-ChildItem $agentsSrc -Filter "*.md" | ForEach-Object {
  Write-Host "  agent $($_.Name)"
}

# --- 3. Overwrite skills ---
Write-Step "Overwriting skills"
$skillsDst = Join-Path $dstRoot "skills"
if (-not $DryRun) {
  if (Test-Path $skillsDst) { Remove-Item $skillsDst -Recurse -Force }
  Ensure-Dir $skillsDst
  Get-ChildItem $skillsSrc -Directory | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $skillsDst $_.Name) -Recurse -Force
    Write-Host "  skill $($_.Name)"
  }
}
else {
  Get-ChildItem $skillsSrc -Directory | ForEach-Object { Write-Host "  [dry-run] skill $($_.Name)" }
}

# --- 4. Overwrite commands ---
Write-Step "Overwriting commands"
$commandsDst = Join-Path $dstRoot "commands"
if (-not $DryRun) {
  if (Test-Path $commandsDst) { Remove-Item $commandsDst -Recurse -Force }
  Ensure-Dir $commandsDst
  Copy-Item (Join-Path $commandsSrc "*.md") $commandsDst -Force
}
Get-ChildItem $commandsSrc -Filter "*.md" | ForEach-Object {
  Write-Host "  command /$($_.BaseName)"
}

# --- 4b. Overwrite tools ---
Write-Step "Overwriting tools"
$toolsDst = Join-Path $dstRoot "tools"
if (-not $DryRun) {
  if (Test-Path $toolsDst) { Remove-Item $toolsDst -Recurse -Force }
  Ensure-Dir $toolsDst
  Copy-Item (Join-Path $toolsSrc "*.ts") $toolsDst -Force
}
Get-ChildItem $toolsSrc -Filter "*.ts" | ForEach-Object {
  Write-Host "  tool $($_.Name)"
}

# --- 5. Overwrite AGENTS.md ---
Write-Step "Overwriting AGENTS.md"
$agentsMdDst = Join-Path $dstRoot "AGENTS.md"
if ($DryRun) {
  Write-Host "  [dry-run] AGENTS.md"
}
else {
  Copy-Item $agentsMdSrc $agentsMdDst -Force
  Write-Host "  ok  AGENTS.md"
}

# --- 6. Write opencode.jsonc (template + merge MCP/LSP from previous) ---
Write-Step "Writing opencode.jsonc (merge MCP/LSP from previous config)"

$homePosix = ($env:USERPROFILE -replace '\\', '/')
$instructionsPath = "$homePosix/.config/opencode/AGENTS.md"

# Build new config as hashtable
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

# Merge from previous config if available
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
  }
  catch {
    Write-Host "  warning: could not parse previous config for merge: $_" -ForegroundColor Yellow
  }
}
else {
  Write-Host "  no previous config to merge — clean template only"
  $newCfg.mcp = [ordered]@{}
}

# Preserve tui.json from backup/live if missing after... we don't delete tui
$tuiDst = Join-Path $dstRoot "tui.json"
$tuiBackup = if ($activeBackup) { Join-Path $activeBackup "tui.json" } else { $null }
if (-not (Test-Path $tuiDst) -and $tuiBackup -and (Test-Path $tuiBackup)) {
  if (-not $DryRun) { Copy-Item $tuiBackup $tuiDst -Force }
  Write-Host "  restored tui.json from backup"
}

$cfgDst = Join-Path $dstRoot "opencode.jsonc"
if ($DryRun) {
  Write-Host "  [dry-run] would write $cfgDst"
}
else {
  $json = ConvertTo-JsoncPretty $newCfg
  # Prepend schema comment header
  $header = @"
{
  "`$schema": "https://opencode.ai/config.json",
"@
  # ConvertTo-Json already includes all keys; write as JSONC with a short banner
  $banner = @"
// OpenCode global config — deployed from agent-skills
// Backup: $(if ($activeBackup) { $activeBackup } else { '(none)' })
// Deployed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
// MCP/LSP merged from previous config when available.

"@
  Set-Content -Path $cfgDst -Value ($banner + $json) -Encoding UTF8
  Write-Host "  ok  opencode.jsonc"
}

# --- 7. Summary ---
Write-Step "Done"
if ($activeBackup) {
  Write-Host "Backup:  $activeBackup"
}
Write-Host "Deployed agents / skills / tools / commands / AGENTS.md / opencode.jsonc"
Write-Host "Restart OpenCode (or open a new session) to load the new global setup."
Write-Host ""
Write-Host "Restore previous global config:" -ForegroundColor Yellow
if ($activeBackup) {
  Write-Host "  robocopy `"$activeBackup`" `"$dstRoot`" /E"
}
else {
  Write-Host "  (no backup path recorded)"
}
