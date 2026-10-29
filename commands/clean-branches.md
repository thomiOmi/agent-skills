---
description: Clean up local git branches that have been deleted on origin
agent: devops
---

## Context

- Local branches with tracking status: !`git branch -v`
- Associated worktrees: !`git worktree list`

## Your task

Prune and delete gone local git branches: $ARGUMENTS

Workflow:
1. Load `git-workflow` skill.
2. Run `git fetch --prune` to update remote tracking branches.
3. Review the branch list above, identify branches marked as `[gone]` (deleted on remote but still local).
4. Check associated worktrees from the worktree list above; branches with `+` prefix have worktrees that must be removed first.
5. For each `[gone]` branch:
   - If an associated worktree exists (and is not the main working tree), run `git worktree remove --force <worktree>`.
   - Run `git branch -d <branch>` to delete the local branch.
6. Print a summary of cleaned branches and worktrees.
