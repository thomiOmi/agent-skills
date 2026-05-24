#!/usr/bin/env bash
# install-skills.sh
# Install global AGENTS.md, SKILL.md files, and INSTALL.md.
# Works for: OpenCode, Claude Code, Gemini CLI on Linux / Mac / WSL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/skills"
SKILLS="task-decomposition code-style api-conventions testing documentation planning debugging ai-integration"

echo "=== Agent Skills Installer ==="
echo ""

# ── 1. OpenCode ──────────────────────────────────────────────────────────────
OPENCODE_DIR="$HOME/.config/opencode"
OPENCODE_SKILLS="$OPENCODE_DIR/skills"

echo "→ Installing for OpenCode..."
mkdir -p "$OPENCODE_SKILLS"
cp "$SCRIPT_DIR/AGENTS.md"  "$OPENCODE_DIR/AGENTS.md"
cp "$SCRIPT_DIR/INSTALL.md" "$OPENCODE_DIR/INSTALL.md"

for skill in $SKILLS; do
  mkdir -p "$OPENCODE_SKILLS/$skill"
  cp "$SKILLS_SRC/$skill/SKILL.md" "$OPENCODE_SKILLS/$skill/SKILL.md"
done

echo "  ✓ AGENTS.md  → $OPENCODE_DIR/AGENTS.md"
echo "  ✓ INSTALL.md → $OPENCODE_DIR/INSTALL.md"
echo "  ✓ Skills     → $OPENCODE_SKILLS/"

if [ ! -f "$OPENCODE_DIR/opencode.json" ]; then
  cat > "$OPENCODE_DIR/opencode.json" <<'EOF'
{
  "model": "anthropic/claude-sonnet-4-5",
  "instructions": ["~/.config/opencode/AGENTS.md"],
  "permission": {
    "ask": "ask"
  }
}
EOF
  echo "  ✓ Created opencode.json (add MCP servers as needed — see INSTALL.md)"
else
  echo "  ⚠ opencode.json exists — verify 'instructions' includes AGENTS.md"
fi

echo ""

# ── 2. Claude Code ───────────────────────────────────────────────────────────
CLAUDE_DIR="$HOME/.claude"
CLAUDE_SKILLS="$CLAUDE_DIR/skills"

echo "→ Installing for Claude Code..."
mkdir -p "$CLAUDE_SKILLS"
cp "$SCRIPT_DIR/AGENTS.md" "$CLAUDE_DIR/AGENTS.md"

for skill in $SKILLS; do
  mkdir -p "$CLAUDE_SKILLS/$skill"
  cp "$SKILLS_SRC/$skill/SKILL.md" "$CLAUDE_SKILLS/$skill/SKILL.md"
done

echo "  ✓ AGENTS.md → $CLAUDE_DIR/AGENTS.md"
echo "  ✓ Skills    → $CLAUDE_SKILLS/"
echo ""

# ── 3. Gemini CLI ────────────────────────────────────────────────────────────
GEMINI_DIR="$HOME/.config/gemini"

echo "→ Installing for Gemini CLI..."
mkdir -p "$GEMINI_DIR"
cp "$SCRIPT_DIR/AGENTS.md" "$GEMINI_DIR/AGENTS.md"
echo "  ✓ AGENTS.md → $GEMINI_DIR/AGENTS.md"
echo ""

# ── Summary ──────────────────────────────────────────────────────────────────
echo "=== Done ==="
echo ""
echo "Skills installed:"
for skill in $SKILLS; do
  echo "  • $skill"
done
echo ""
echo "Next steps:"
echo "  1. Edit ~/.config/opencode/opencode.json to add your model and MCP servers"
echo "     (see INSTALL.md for the full template)"
echo "  2. Per-project: create AGENTS.md at project root, fill in [Project Context]"
echo "  3. Symlink for other tools — see INSTALL.md"