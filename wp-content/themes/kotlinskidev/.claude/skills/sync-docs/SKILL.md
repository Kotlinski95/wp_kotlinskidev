---
name: sync-docs
description: "Keep CHANGELOG.md, docs/treeview.md, and the theme version in sync with actual code changes in the kotlinskidev theme. Run this before considering ANY coding task in this theme finished — adding/removing/renaming a block, pattern, template, function module, or test file; fixing a bug; changing behavior. Also use when explicitly asked to update the changelog, update treeview, bump the version, or cut a release."
---

# Sync Docs

This theme tracks its own history in three places that drift out of sync easily: `CHANGELOG.md`, `docs/treeview.md`, and the version number (`style.css` + `package.json`). This skill is the checklist to run before treating any change as done — not a one-time cleanup, a habit for every task.

## 1. Does this change need a CHANGELOG entry?

Almost always yes, if real code/content changed. Skip only for: pure exploration/investigation with no file changes, or a change already covered by an entry you're about to add for the same task (don't double-log one piece of work).

**Format — this is the part most likely to be gotten wrong:**

- **2-3 sentences, no more — count them before you save.** State what changed and why it matters; drop the narrative, the exhaustive reasoning, the blow-by-blow of how you got there. If you're tempted to write a fourth sentence, that detail belongs in the commit message or the code's own comments (if truly non-obvious), not here. This file was rewritten from ~270 lines of multi-paragraph entries down to ~90 lines specifically to stay readable — don't let it regrow. It has drifted back to bloated multi-sentence entries and needed a full re-compaction more than once already; if a new entry runs long because a bug had a genuinely deep root cause, cut it down anyway — the depth belongs in the commit message, not here, no exceptions for "this one was interesting."
- **Date every entry**, bold at the start: `` - **YYYY-MM-DD** — ... `` Use the actual date the work happened, not a guess. Multiple entries can share a date.
- **File under `[Unreleased]`**, in the right `###` category: `Chore`, `Security`, `Added`, `Changed`, `Fixed`, `Performance`, `Internationalization`. If `[Unreleased]` doesn't exist yet (it's empty after a release cut), add it back at the top with the right category heading.
- Reference real file/function/block names so a future reader can find the change, but don't restate the diff — say what it does and why, not every line touched.

Bad (too long, narrates the process): "Investigated why X was happening by checking Y and Z, then discovered that... after trying A and B, settled on C because D, and verified via E, F, G..."

Good (2-3 sentences, states outcome + reason): "**2026-08-09** — Fixed `search-form.php`'s unclosed `wp:html` block, which was silently breaking Gutenberg's content validation. Confirmed via `wp.blocks.parse()` directly rather than guessing from the markup."

## 2. Does `docs/treeview.md` need an update?

Check if the change added, removed, or renamed any of: a block (`src/blocks/`), a pattern (`patterns/`), a template (`templates/`), a function module (`functions/`, `includes/`), or a test file (`tests/`). If yes:

- Add/remove/rename the corresponding line, matching the existing one-line-comment style exactly (see neighboring entries in the same section for tone/format).
- Update any count in a parent directory's own comment line (e.g. `functions/` says `# 52 PHP modules` — bump it if you added or removed one).
- Don't restructure sections you didn't touch. This file is a current-state snapshot, not a place to editorialize.

If unsure whether something counts as a "module" worth listing individually (vs. a supporting file), match the existing granularity in that section — `functions/` lists every file, `src/blocks/` groups by block directory, `tests/integration/tests/` is summarized by count since it's a 1:1 mirror of already-listed `functions/` modules.

## 3. Does the version need bumping?

**Usually no.** Adding a `[Unreleased]` entry is normal, routine work. Bumping `style.css`'s `Version:` and `package.json`'s `"version"` is a **release action** — it only happens when actually cutting a release, which means moving everything in `[Unreleased]` under a new dated version heading and starting a fresh empty `[Unreleased]`. Don't do this reflexively per-commit; it makes the version number meaningless.

Cut a release when:

- The user explicitly asks to bump the version / cut a release, or
- `[Unreleased]` has accumulated enough real, shipped work that leaving it unversioned stops making sense (a judgment call — when in doubt, ask rather than assume).

When cutting a release:

1. Decide the bump size from what's actually in `[Unreleased]`, per this file's own semver rules (see its header): any `### Added` entry with a real new capability → at least **MINOR**; only fixes/chores/security patches with nothing new → **PATCH**; anything requiring editors to re-save content or breaking an existing block/attribute → **MAJOR**. State the reasoning, don't just pick one.
2. Rename `## [Unreleased]` → `## [X.Y.Z] — YYYY-MM-DD` (today's date), keeping all its entries as-is.
3. Add a fresh `## [Unreleased]` section above it (can be empty — `_Nothing yet._` is fine).
4. Bump `Version:` in `style.css` and `"version"` in `package.json` to the same new number — they must always match.
5. Confirm `package.json` is still valid JSON after the edit (`node -e "require('./package.json')"`).

## 4. Anything else that drifted?

Quick checks, only relevant if the change actually touches these:

- `docs/testing.md` — if tests changed, does its narrative/coverage summary still match reality?
- `README.md` — if the change altered a block/pattern/template *count* the README states (it already runs slightly stale — don't let a new change widen that gap further).
- The relevant `.claude/rules/*.md` file — if you learned a genuinely new, reusable rule (not specific to this one task), add it there so the next session doesn't have to rediscover it.

Don't touch any of these speculatively — only when the change at hand actually affects what they claim.
