# SRC — Entry Point & Core

## OVERVIEW

Single entry point for both GitHub Actions and local execution via `src/action-entry.js`. Core logic in `src/core/`.

## STRUCTURE

```
src/
├── action-entry.js # GitHub Actions entry (also for local use) — 70 lines
└── core/
    ├── setup.js    # Shared core logic — 232 lines
    └── logger.js   # Dual logger (CI / local) — 59 lines
```

## FILES

| File | Purpose | Key exports |
|------|---------|-------------|
| `action-entry.js` | GitHub Action entry via `@actions/core` | `run()` — reads `agent_type` + `replace_env` inputs, resolves bundled skills path, calls `setup()`, sets outputs |
| `core/logger.js` | Dual logger — CI uses `@actions/core`, local uses `console` | `info()`, `warn()`, `error()`, `debug()`, `setFailed()` |
| `core/setup.js` | Core setup orchestrator | See [src/core/AGENTS.md](core/AGENTS.md) |

## CONVENTIONS

- CommonJS (`require()`) throughout
- Entry point is thin — all logic delegates to `setup()`
- Logger auto-detects environment (CI vs local) — use `logger` instead of `console.log` directly
- For local use: `node src/action-entry.js` (reads from env vars or defaults)
