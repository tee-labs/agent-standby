# SRC/CORE — Setup Logic

## OVERVIEW

`setup.js` (209 lines) — the single core module. Resolves config directories, copies skills, downloads gist configs, and writes GitHub Actions env vars.

## KEY EXPORTS

| Export | Purpose |
|--------|---------|
| `setup(options)` | Main orchestrator — agentType, skillsPath → result object |
| `resolveConfigDir(agentType)` | Maps agent type → `~/.opencode` or `~/.claude` |
| `writeOpencodeConfig(configDir)` | Downloads gist files to `~/.config/opencode/` |
| `CONFIG_FILES` | Array of `{url, filename}` — AGENTS.md, opencode.jsonc, oh-my-openagent.json |
| `VALID_AGENT_TYPES` | `['opencode', 'claude']` |

## CONSTANTS

- `AGENT_CONFIG_DIRS`: `opencode` → `.opencode`, `claude` → `.claude`
- `OPENCODE_CONFIG_DIR_NAME`: `.config/opencode` (separate from agent config dir)

## FLOW

1. Normalize agent type (validate against `VALID_AGENT_TYPES`)
2. Resolve skills path (must exist, must be directory)
3. Create config dir, copy skills → `<configDir>/skills/`
4. Download gist config files → `~/.config/opencode/`
5. If in GitHub Actions, write env vars (`AGENT_STANDBY_*`) to `GITHUB_ENV`

## GOTCHAS

- `writeAgentConfig()` is **commented out** (line 170) — config comes from gists, not local generation
- Gist downloads follow HTTP→HTTPS redirects
- Home dir resolution: `HOME` → `USERPROFILE` → `HOMEDRIVE+HOMEPATH` → `os.homedir()`
