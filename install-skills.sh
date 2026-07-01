#!/usr/bin/env bash
# install-skills.sh
# Install AGENTS.md and SKILL.md files for OpenCode CLI.
# Supports agentskills.io folder structure with references/ and assets/
# Also installs to ~/.agents/skills (universal: OpenCode, Claude Code, GitHub Copilot)
#
# Usage:
#   ./install-skills.sh              # install everything
#   ./install-skills.sh --skills-only  # install skills only (skip AGENTS.md)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/skills"
SKILLS="task-decomposition code-style api-conventions testing documentation planning debugging ai-integration sdlc-documentation git-workflow security-review database knowledge-management"
SKILLS_ONLY=false

for arg in "$@"; do
  case $arg in
    --skills-only) SKILLS_ONLY=true ;;
  esac
done

OPENCODE_DIR="$HOME/.config/opencode"
OPENCODE_SKILLS="$OPENCODE_DIR/skills"
UNIVERSAL_SKILLS="$HOME/.agents/skills"
GLOBAL_KNOWLEDGE="$HOME/.agents/knowledge.md"

echo "=== Agent Skills Installer ==="
[ "$SKILLS_ONLY" = true ] && echo "Mode: skills only (AGENTS.md skipped)"
echo ""

# Helper: install skills to a target directory
install_skills() {
  local target_dir="$1"
  mkdir -p "$target_dir"

  for skill in $SKILLS; do
    src="$SKILLS_SRC/$skill"
    dest="$target_dir/$skill"

    if [ ! -d "$src" ]; then
      echo "  ⚠ SKIP $skill — not found in skills/"
      continue
    fi

    rm -rf "$dest"
    cp -r "$src" "$dest"

    ref_count=$(find "$dest/references" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✓ $skill ($ref_count references)"
  done

  echo "  → $target_dir"
}

# Helper: add value to instructions array in config file
add_to_instructions() {
  local config_file="$1"
  local value="$2"

  if grep -q "$value" "$config_file" 2>/dev/null; then
    echo "  ↓ SKIP $(basename $config_file) already includes $(basename $value)"
    return
  fi

  if grep -q '"instructions"' "$config_file"; then
    # Add to existing instructions array
    sed -i "s|\"instructions\": \[|\"instructions\": [\"$value\", |" "$config_file"
    echo "  ✓ Added $(basename $value) to instructions in $(basename $config_file)"
  else
    echo "  ⚠ No instructions field in $(basename $config_file) — add manually"
  fi
}

# ── 1. OpenCode CLI ──────────────────────────────────────────────────────────
echo "→ Installing for OpenCode CLI..."
mkdir -p "$OPENCODE_SKILLS"

if [ "$SKILLS_ONLY" = false ]; then
  cp "$SCRIPT_DIR/AGENTS.md"  "$OPENCODE_DIR/AGENTS.md"
  cp "$SCRIPT_DIR/INSTALL.md" "$OPENCODE_DIR/INSTALL.md"
  echo "  ✓ AGENTS.md  → $OPENCODE_DIR/AGENTS.md"
  echo "  ✓ INSTALL.md → $OPENCODE_DIR/INSTALL.md"
fi

install_skills "$OPENCODE_SKILLS"

# Handle config file
if [ "$SKILLS_ONLY" = false ]; then
  CONFIG_JSONC="$OPENCODE_DIR/opencode.jsonc"
  CONFIG_JSON="$OPENCODE_DIR/opencode.json"
  AGENTS_PATH="$HOME/.config/opencode/AGENTS.md"

  if [ -f "$CONFIG_JSONC" ]; then
    if grep -q '"instructions"' "$CONFIG_JSONC"; then
      echo "  ⚠ opencode.jsonc already has 'instructions' — verify it includes AGENTS.md"
    else
      sed -i 's/}[[:space:]]*$/,/\n  "instructions": ["~\/\.config\/opencode\/AGENTS.md"],\n  "permission": { "skill": { "*": "allow" } }\n}/' "$CONFIG_JSONC"
      echo "  ✓ Updated opencode.jsonc"
    fi
  elif [ -f "$CONFIG_JSON" ]; then
    if grep -q '"instructions"' "$CONFIG_JSON"; then
      echo "  ⚠ opencode.json already has 'instructions' — verify it includes AGENTS.md"
    else
      sed -i 's/}[[:space:]]*$/,/\n  "instructions": ["~\/\.config\/opencode\/AGENTS.md"],\n  "permission": { "skill": { "*": "allow" } }\n}/' "$CONFIG_JSON"
      echo "  ✓ Updated opencode.json"
    fi
  else
    cat > "$CONFIG_JSONC" <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["~/.config/opencode/AGENTS.md"],
  "permission": {
    "skill": {
      "*": "allow"
    }
  }
}
EOF
    echo "  ✓ Created opencode.jsonc"
  fi
fi

echo ""

# ── 2. Universal path ~/.agents/skills ──────────────────────────────────────
echo "→ Installing to universal path (~/.agents/skills)..."
install_skills "$UNIVERSAL_SKILLS"
echo ""

# ── 3. Knowledge file setup ──────────────────────────────────────────────────
echo "→ Setting up knowledge files..."

# Create global knowledge file from template if not exists
KNOWLEDGE_TEMPLATE="$UNIVERSAL_SKILLS/knowledge-management/assets/knowledge.md.template"

if [ ! -f "$GLOBAL_KNOWLEDGE" ]; then
  if [ -f "$KNOWLEDGE_TEMPLATE" ]; then
    cp "$KNOWLEDGE_TEMPLATE" "$GLOBAL_KNOWLEDGE"
    echo "  ✓ Created ~/.agents/knowledge.md from template"
  else
    echo "  ⚠ SKIP knowledge template not found"
  fi
else
  echo "  ↓ SKIP ~/.agents/knowledge.md already exists — not overwritten"
fi

# Add global knowledge to opencode config instructions
CONFIG_JSONC="$OPENCODE_DIR/opencode.jsonc"
CONFIG_JSON="$OPENCODE_DIR/opencode.json"

if [ -f "$CONFIG_JSONC" ]; then
  add_to_instructions "$CONFIG_JSONC" "$GLOBAL_KNOWLEDGE"
elif [ -f "$CONFIG_JSON" ]; then
  add_to_instructions "$CONFIG_JSON" "$GLOBAL_KNOWLEDGE"
fi

echo ""

# ── Summary ──────────────────────────────────────────────────────────────────
echo "=== Done ==="
echo ""
echo "Skills installed ($(echo $SKILLS | wc -w | tr -d ' ')):"
for skill in $SKILLS; do echo "  • $skill"; done
echo ""
echo "Install locations:"
echo "  OpenCode CLI  : $OPENCODE_SKILLS"
echo "  Universal     : $UNIVERSAL_SKILLS"
echo ""
echo "Knowledge files:"
echo "  Global        : $GLOBAL_KNOWLEDGE"
echo "  Per-project   : KNOWLEDGE.md at project root"
echo "                  (copy from templates/KNOWLEDGE.md.template)"
echo ""
echo "Next steps:"
if [ "$SKILLS_ONLY" = true ]; then
  echo "  1. AGENTS.md loaded remotely from GitHub — no action needed"
else
  echo "  1. Verify: cat ~/.config/opencode/opencode.jsonc"
fi
echo "  2. Set provider: opencode providers"
echo "  3. Per-project: copy templates/KNOWLEDGE.md.template to project root as KNOWLEDGE.md"
echo "  4. Per-project: run /init inside OpenCode to generate AGENTS.md"
