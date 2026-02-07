# Copilot Instructions

## About Me
- Name: Adrian Kotliński
- Working on: WordPress theme development, React/TypeScript projects, Angular (Spartacus)

## Project Structure
- **adriankotlinski/** - Personal WordPress site
  - Custom theme: `wp-content/themes/kotlinskidev/`

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
