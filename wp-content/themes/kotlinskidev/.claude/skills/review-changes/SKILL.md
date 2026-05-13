---
name: review-changes
description: "Run a pre-push code review on the current git changes in the kotlinskidev theme. Use before pushing or opening a PR. Optionally pass a file path to scope the review."
---

# Review Changes

Launch the `code-reviewer` subagent to review all current git changes in the kotlinskidev theme before pushing to GitHub.

## Instructions

Use the Agent tool to launch the `code-reviewer` subagent. Pass the following as the prompt:

> Review the current git changes in the kotlinskidev theme. Run `git diff HEAD` and `git status --short` to identify what has changed, then review each file according to the project conventions. $ARGUMENTS

When the subagent completes, present its full review output to the user.
