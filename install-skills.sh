#!/usr/bin/env bash
# install-skills.sh
# Install AGENTS.md and SKILL.md files for OpenCode CLI.
#
# Usage:
#   ./install-skills.sh              # install everything
#   ./install-skills.sh --skills-only  # install skills only (skip AGENTS.md)
#                                       # use when AGENTS.md is loaded remotely

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/skills"
SKILLS="task-decomposition code-style api-conventions testing documentation planning debugging ai-integration"
SKILLS_ONLY=false

for arg in "$@"; do
  case $arg in
    --skills-only) SKILLS_ONLY=true ;;
  esac
done

OPENCODE_DIR="$HOME/.config/opencode"
OPENCODE_SKILLS="$OPENCODE_DIR/skills"

echo "=== Agent Skills Installer ==="
[ "$SKILLS_ONLY" = true ] && echo "Mode: skills only (AGENTS.md skipped)"
echo ""

echo "→ Installing for OpenCode CLI..."
mkdir -p "$OPENCODE_SKILLS"

if [ "$SKILLS_ONLY" = false ]; then
  cp "$SCRIPT_DIR/AGENTS.md"  "$OPENCODE_DIR/AGENTS.md"
  cp "$SCRIPT_DIR/INSTALL.md" "$OPENCODE_DIR/INSTALL.md"
  echo "  ✓ AGENTS.md  → $OPENCODE_DIR/AGENTS.md"
  echo "  ✓ INSTALL.md → $OPENCODE_DIR/INSTALL.md"
fi

for skill in $SKILLS; do
  mkdir -p "$OPENCODE_SKILLS/$skill"
  cp "$SKILLS_SRC/$skill/SKILL.md" "$OPENCODE_SKILLS/$skill/SKILL.md"
done
echo "  ✓ Skills     → $OPENCODE_SKILLS/"

# Handle config file
if [ "$SKILLS_ONLY" = false ]; then
  CONFIG_JSONC="$OPENCODE_DIR/opencode.jsonc"
  CONFIG_JSON="$OPENCODE_DIR/opencode.json"

  if [ -f "$CONFIG_JSONC" ]; then
    if grep -q '"instructions"' "$CONFIG_JSONC"; then
      echo "  ⚠ opencode.jsonc already has 'instructions' — verify it includes AGENTS.md"
    else
      sed -i 's/}[[:space:]]*$/,\n  "instructions": ["~\/.config\/opencode\/AGENTS.md"],\n  "permission": { "skill": { "*": "allow" } }\n}/' "$CONFIG_JSONC"
      echo "  ✓ Updated opencode.jsonc"
    fi
  elif [ -f "$CONFIG_JSON" ]; then
    if grep -q '"instructions"' "$CONFIG_JSON"; then
      echo "  ⚠ opencode.json already has 'instructions' — verify it includes AGENTS.md"
    else
      sed -i 's/}[[:space:]]*$/,\n  "instructions": ["~\/.config\/opencode\/AGENTS.md"],\n  "permission": { "skill": { "*": "allow" } }\n}/' "$CONFIG_JSON"
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
echo "=== Done ==="
echo ""
echo "Skills installed:"
for skill in $SKILLS; do echo "  • $skill"; done
echo ""
echo "Next steps:"
if [ "$SKILLS_ONLY" = true ]; then
  echo "  1. AGENTS.md loaded remotely from GitHub — no action needed"
else
  echo "  1. Verify: cat ~/.config/opencode/opencode.jsonc"
fi
echo "  2. Set provider: opencode providers"
echo "  3. Per-project: create AGENTS.md and fill in [Project Context]"
echo "     Or run /init inside OpenCode to generate it automatically"