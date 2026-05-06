# SRC/CORE — Setup Logic

## OVERVIEW

`setup.js` (173 lines) — the single core module. Resolves config directories, copies skills, copies local config files, and writes GitHub Actions env vars.

## KEY EXPORTS

| Export | Purpose |
|--------|---------|
| `setup(options)` | Main orchestrator — agentType, skillsPath (from bundled package) → result object |
| `resolveConfigDir(agentType)` | Maps agent type → `~/.opencode` or `~/.claude` |
| `writeOpencodeConfig(configDir)` | Copies local config files to `~/.config/opencode/` |
| `CONFIG_FILES` | Array of `{filename}` — AGENTS.md, opencode.jsonc, oh-my-openagent.json |
| `getLocalConfigDir()` | Returns path to `configs/` directory (2 levels up from src/core/) |
| `VALID_AGENT_TYPES` | `['opencode', 'claude']` |

## CONSTANTS

- `AGENT_CONFIG_DIRS`: `opencode` → `.opencode`, `claude` → `.claude`
- `OPENCODE_CONFIG_DIR_NAME`: `.config/opencode` (separate from agent config dir)

## FLOW

1. Normalize agent type (validate against `VALID_AGENT_TYPES`)
2. Resolve skills path (must exist, must be directory)
3. Create config dir, copy skills → `<configDir>/skills/`
4. Copy local config files from `configs/` → `~/.config/opencode/`
5. If in GitHub Actions, write env vars (`AGENT_STANDBY_*`) to `GITHUB_ENV`

## GOTCHAS

- `writeAgentConfig()` is **commented out** (line 134) — config comes from local `configs/` directory, not generated
- Config files are read from `configs/` (relative to project root) via `getLocalConfigDir()`
- Home dir resolution: `HOME` → `USERPROFILE` → `HOMEDRIVE+HOMEPATH` → `os.homedir()`
