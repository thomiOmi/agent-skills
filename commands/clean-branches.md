---
description: Clean up local git branches that have been deleted on origin
agent: devops
---

Prune and delete gone local git branches: $ARGUMENTS

Workflow:
1. Run `git fetch --prune` to update remote tracking branches.
2. Identify local branches marked as `[gone]`.
3. Safely remove associated worktrees if present.
4. Delete local `[gone]` branches (`git branch -d <branch>`).
5. Print summary of cleaned branches.
