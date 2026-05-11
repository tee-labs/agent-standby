# SRC/CORE — Setup Logic

## OVERVIEW

`setup.js` (232 lines) — the single core module. Resolves config directories, copies skills, copies plugins, copies local config files, ensures context-mode, and writes GitHub Actions env vars. `logger.js` (59 lines) — dual logger for CI/local output.

## KEY EXPORTS

| Export | Purpose |
|--------|---------|
| `setup(options)` | Main orchestrator — agentType, skillsPath (from bundled package) → result object |
| `resolveConfigDir(agentType)` | Maps agent type → `~/.opencode` or `~/.claude` |
| `normalizeAgentType(type)` | Validates + normalizes agent type string |
| `isGitHubActions()` | Returns true if running in CI (`GITHUB_ACTIONS` env) |
| `writeGitHubEnv(configDir, skillsDir, agentType)` | Writes `AGENT_STANDBY_*` vars to `GITHUB_ENV` |
| `writeOpencodeConfig(configDir)` | Copies local config files to `~/.config/opencode/` |
| `replaceEnvPlaceholders(content)` | Replaces `${ENV_VAR}` placeholders in config content |
| `copyDirectory(src, dest)` | Recursive directory copy |
| `ensureContextMode(configDir)` | Installs context-mode MCP if not present |
| `getLocalConfigDir()` | Returns path to `configs/` directory (2 levels up from src/core/) |
| `getLocalPluginsDir()` | Returns path to `plugins/` directory (3 levels up from src/core/) |
| `CONFIG_FILES` | Array of `{filename}` — AGENTS.md, opencode.jsonc, oh-my-openagent.json |
| `VALID_AGENT_TYPES` | `['opencode', 'claude']` |

## CONSTANTS

- `AGENT_CONFIG_DIRS`: `opencode` → `.opencode`, `claude` → `.claude`
- `OPENCODE_CONFIG_DIR_NAME`: `.config/opencode` (separate from agent config dir)

## FLOW

1. Normalize agent type (validate against `VALID_AGENT_TYPES`)
2. Resolve skills path (must exist, must be directory)
3. Create config dir, copy skills → `<configDir>/skills/`
4. Copy local config files from `configs/` → `~/.config/opencode/`
5. Copy plugins from `plugins/` → `~/.opencode/plugins/` (opencode only)
6. Ensure context-mode MCP is installed
7. If `replace_env` is true, replace `${ENV_VAR}` placeholders in config files
8. If in GitHub Actions, write env vars (`AGENT_STANDBY_*`) to `GITHUB_ENV`

## GOTCHAS

- `writeAgentConfig()` is **commented out** (line 134) — config comes from local `configs/` directory, not generated
- Config files are read from `configs/` (relative to project root) via `getLocalConfigDir()`
- Plugins are read from `plugins/` (relative to project root) via `getLocalPluginsDir()`
- Home dir resolution: `HOME` → `USERPROFILE` → `HOMEDRIVE+HOMEPATH` → `os.homedir()`
- `ensureContextMode()` appends context-mode config to `.opencode.json` — only for opencode agent type
- `replaceEnvPlaceholders()` is only called when `replace_env` input is true
