# Copilot Instructions

## About Me
- Name: Adrian Kotliński
- Working on: WordPress theme development, React/TypeScript projects, Angular (Spartacus)

## Project Structure
- **adriankotlinski/** - Personal WordPress site
  - Custom theme: `wp-content/themes/kotlinskidev/`

## Custom Agents
Specialized agents in `.github/agents/` — invoke in Copilot Chat with `@agent-name`:

### WordPress Development
- `@block-builder` — scaffold a Gutenberg block extension (theme `src/blocks/`) or standalone block plugin. Describe the block purpose and target block type.
- `@plugin-scaffold` — generate a full custom plugin boilerplate matching the class-based PHP + TypeScript + webpack structure of existing plugins.
- `@pattern-builder` — create, debug, or fix a WordPress block pattern PHP file. Knows all registered categories, theme preset values, and common block markup pitfalls.

### Design
- `@design-system` — design guidance for any UI component or section. Enforces light/dark theme support, references EPAM/Wolański/Smart Agency aesthetics, and produces full SCSS with both modes, hover/focus states, and motion rules.

### Code Quality
- `@refactor` — apply SOLID principles, clean code, and design patterns to existing code without changing behavior. Works across TS, SCSS, and PHP.
- `@performance-audit` — audit a file or area for performance issues: layout thrash, missing passive listeners, N+1 queries, memory leaks, Core Web Vitals impact.
- `@code-reviewer` — full pre-push code review: bugs, logic errors, TS types, WP escaping, SCSS variables.

### Workflow
- `@commit-helper` — analyze staged changes and generate a conventional commit message with correct type and scope.
- `@deploy-checker` — pre-deployment checklist: `.deployignore` integrity, debug code, local URLs, missing `dist/`, PHP safety.

### Workflow Pipelines (multi-agent chains)
These orchestrate multiple agents in sequence — one command, full pipeline:
- `@pre-deploy` — performance audit → deploy safety check → commit message. Run before every push to `main`.
- `@code-cleanup` — performance audit → SOLID/clean code refactor on the same file. Produces a single cleaned-up file ready to commit.

**When to use agents vs inline Copilot:**
- Use pipeline agents (`@pre-deploy`, `@code-cleanup`) for end-to-end multi-step tasks
- Use single agents for focused tasks (scaffolding, auditing one area, reviewing one file)
- Use inline Copilot (Tab/chat) for single-line completions, quick fixes, and explanations

**Agent routing — when a request matches an agent's scope, always suggest using that agent instead of answering inline:**
- Any request to create, scaffold, or add a new Gutenberg block → suggest `@block-builder`
- Any request to create a new plugin → suggest `@plugin-scaffold`
- Any request to create or fix a block pattern → suggest `@pattern-builder`
- Any pre-push / deployment check → suggest `@pre-deploy`
- Any refactor or code quality request on a specific file → suggest `@code-cleanup` or `@refactor`
- Any performance concern, Core Web Vitals question, or suspected memory leak → suggest `@performance-audit`
- Any request to clean up, optimise, or refactor a specific file end-to-end → suggest `@code-cleanup`
- Any request to design a component, choose colors, handle theming, or match a visual style → suggest `@design-system`

## Custom Prompt Files
Reusable prompts in `.github/prompts/` — apply via Copilot Chat with `/prompt-name` or `#filename`:
- `code-review.prompt.md` — pre-push review checklist (bugs, logic, leaks, performance)
- `code-style.prompt.md` — enforce project style rules (TS, SCSS, naming conventions)
- `wordpress-rules.prompt.md` — WordPress/PHP standards and best practices
- `typescript-scss-rules.prompt.md` — theme-specific TS and SCSS patterns

**When to use prompts vs agents:**
- Prompts = apply a ruleset to code you paste inline
- Agents = autonomous multi-step tasks that read/edit files themselves

## Code Preferences

### General
- Be concise and direct - skip unnecessary explanations and creating .MD files if not asked specifically
- Focus on implementation over discussion
- Use clear, descriptive variable and function names
- Follow clean code principles, SOLID, designs patterns when applicable
- Avoid over-engineering - keep it simple and straightforward
- Focus on maintainability, reusability and performance

### TypeScript/JavaScript
- Basic common theme script source: `wp-content/themes/kotlinskidev/src/scripts/`
- Use TypeScript strict mode
- Prefer functional components and hooks in React
- Use arrow functions for consistency
- Async/await over promises chains
- Use modern ES6+ features

### Styles
- Basic common theme style source: `wp-content/themes/kotlinskidev/src/styles/`
- Preferable to use .scss for styles, but can use .css when absolutely needed

### WordPress/PHP
- Follow WordPress coding standards
- Use WordPress functions over raw PHP when available
- Prefer wp_enqueue_script/style over hardcoding
- Make sure everything would be easy to manage from Wordpress admin panel


## Don't Include in Responses
- Full file paths when unnecessary - use relative paths
- Detailed explanations of basic concepts
- Multiple similar examples when one suffices
- Workspace structure overviews unless relevant

## When Making Changes
- Make edits directly instead of suggesting
- Run commands when needed, don't just describe them
- Test changes when appropriate
- Keep commit messages concise and clear

## Comments
- Please do not create any inline comments, use clean code principles to make the code self-explanatory instead. Only add comments when absolutely necessary to explain complex logic or decisions that are not obvious from the code itself.

## Formatter
- Use Prettier for code formatting with default settings
