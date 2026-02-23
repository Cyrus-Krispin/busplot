# Busplot – Agent Instructions

Project conventions for AI-assisted development.

## Commits

**Keep commit messages short.** One line max.

## Architecture

**Split code into focused components.** Do not write everything in one file.

- **Screens** (`mobile/src/screens/`) – Thin orchestration: compose components and hooks.
- **Components** (`mobile/src/components/`) – One responsibility per file.
- **Constants** (`mobile/src/constants/`) – Config, magic numbers, shared values.
- **Hooks** (`mobile/src/hooks/`) – Reusable logic.

See `.cursor/rules/component-architecture.mdc` for detailed guidance.
