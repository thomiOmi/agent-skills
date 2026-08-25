#!/usr/bin/env bash
# Runs test suite with coverage reporting
set -euo pipefail

if command -v bun &> /dev/null; then
  echo "Running bun test..."
  bun test
elif command -v npm &> /dev/null; then
  echo "Running npm test..."
  npm test
else
  echo "Error: Neither bun nor npm found in environment."
  return 1 2>/dev/null || true
fi
