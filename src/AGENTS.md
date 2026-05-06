# SRC — Entry Point

## OVERVIEW

Single entry point for both GitHub Actions and local execution via `src/action-entry.js`.

## STRUCTURE

```
src/
├── action-entry.js     # GitHub Actions entry (also for local use)
└── core/
    └── setup.js        # Shared core logic
```

## FILES

| File | Purpose | Key exports |
|------|---------|-------------|
| `action-entry.js` | GitHub Action entry via `@actions/core` | `run()` — reads `agent_type`/`skills_path` inputs, calls `setup()`, sets outputs |

## CONVENTIONS

- CommonJS (`require()`) throughout
- Entry point is thin — all logic delegates to `setup()`
- For local use: `node src/action-entry.js` (reads from env vars or defaults)

