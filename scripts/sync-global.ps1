#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Sync agent-skills agents and skills into the global OpenCode config.

.DESCRIPTION
  Copies agents/*.md and skills/* from this repo into ~/.config/opencode/.
  Preserves global-only agents (code-reviewer, laravel-simplifier) and
  third-party skills (graphify, obsidian-skills, etc.) that are not in this repo.

.PARAMETER DryRun
  Show what would be copied without writing files.

.EXAMPLE
  pwsh ./scripts/sync-global.ps1
  pwsh ./scripts/sync-global.ps1 -DryRun
#>
param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$globalRoot = Join-Path $env:USERPROFILE ".config\opencode"
$agentsSrc = Join-Path $repoRoot "agents"
$skillsSrc = Join-Path $repoRoot "skills"
$toolsSrc = Join-Path $repoRoot "tools"
$commandsSrc = Join-Path $repoRoot "commands"
$agentsDst = Join-Path $globalRoot "agents"
$skillsDst = Join-Path $globalRoot "skills"
$toolsDst = Join-Path $globalRoot "tools"
$commandsDst = Join-Path $globalRoot "commands"

if (-not (Test-Path $globalRoot)) {
  throw "Global OpenCode directory not found: $globalRoot"
}

New-Item -ItemType Directory -Path $agentsDst -Force | Out-Null
New-Item -ItemType Directory -Path $skillsDst -Force | Out-Null
New-Item -ItemType Directory -Path $toolsDst -Force | Out-Null
New-Item -ItemType Directory -Path $commandsDst -Force | Out-Null

Write-Host "Repo:   $repoRoot"
Write-Host "Global: $globalRoot"
Write-Host ""

# --- Agents ---
$agentFiles = Get-ChildItem -Path $agentsSrc -Filter "*.md" -File
Write-Host "Syncing $($agentFiles.Count) agents..."
foreach ($file in $agentFiles) {
  $dest = Join-Path $agentsDst $file.Name
  if ($DryRun) {
    Write-Host "  [dry-run] agent $($file.Name)"
  }
  else {
    Copy-Item -Path $file.FullName -Destination $dest -Force
    Write-Host "  ok  agent $($file.Name)"
  }
}

# --- Skills ---
$skillDirs = Get-ChildItem -Path $skillsSrc -Directory
Write-Host ""
Write-Host "Syncing $($skillDirs.Count) skills..."
foreach ($dir in $skillDirs) {
  $dest = Join-Path $skillsDst $dir.Name
  if ($DryRun) {
    Write-Host "  [dry-run] skill $($dir.Name)"
  }
  else {
    if (Test-Path $dest) {
      Remove-Item -Path $dest -Recurse -Force
    }
    Copy-Item -Path $dir.FullName -Destination $dest -Recurse -Force
    Write-Host "  ok  skill $($dir.Name)"
  }
}

# --- Tools ---
$toolFiles = Get-ChildItem -Path $toolsSrc -Filter "*.ts" -File
Write-Host ""
Write-Host "Syncing $($toolFiles.Count) tools..."
foreach ($file in $toolFiles) {
  $dest = Join-Path $toolsDst $file.Name
  if ($DryRun) {
    Write-Host "  [dry-run] tool $($file.Name)"
  }
  else {
    Copy-Item -Path $file.FullName -Destination $dest -Force
    Write-Host "  ok  tool $($file.Name)"
  }
}

# --- Commands ---
$commandFiles = Get-ChildItem -Path $commandsSrc -Filter "*.md" -File
Write-Host ""
Write-Host "Syncing $($commandFiles.Count) commands..."
foreach ($file in $commandFiles) {
  $dest = Join-Path $commandsDst $file.Name
  if ($DryRun) {
    Write-Host "  [dry-run] command $($file.Name)"
  }
  else {
    Copy-Item -Path $file.FullName -Destination $dest -Force
    Write-Host "  ok  command $($file.Name)"
  }
}

Write-Host ""
if ($DryRun) {
  Write-Host "Dry run complete. Re-run without -DryRun to apply."
}
else {
  Write-Host "Sync complete. Restart OpenCode (or start a new session) to pick up changes."
  Write-Host "Preserved global-only items outside this repo (e.g. custom agents, third-party skills, tools, commands)."
}
