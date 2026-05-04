# SRC — Entry Points

## OVERVIEW

Two entry points sharing core setup logic via `src/core/setup.js`.

## STRUCTURE

```
src/
├── action-entry.js     # GitHub Actions entry
├── cli-entry.js        # CLI entry (commander)
└── core/
    └── setup.js        # Shared core logic
```

## FILES

| File | Purpose | Key exports |
|------|---------|-------------|
| `action-entry.js` | GitHub Action entry via `@actions/core` | `run()` — reads `agent_type`/`skills_path` inputs, calls `setup()`, sets outputs |
| `cli-entry.js` | CLI entry via `commander` | `-a/--agent` (opencode\|claude), `-s/--skills` path, calls `setup()` |

## CONVENTIONS

- CommonJS (`require()`) throughout
- Both entry points are thin — all logic delegates to `setup()`
- `cli-entry.js` has shebang (`#!/usr/bin/env node`) for direct execution
