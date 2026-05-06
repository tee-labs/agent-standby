# agent-standby

[![npm](https://img.shields.io/npm/v/@mccxj/agent-standby)](https://www.npmjs.com/package/@mccxj/agent-standby)
[![GitHub Release](https://img.shields.io/github/v/release/mccxj/agent-standby)](https://github.com/mccxj/agent-standby/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Initialize AI agent configuration, environment variables, and skills for CI. Supports [OpenCode](https://opencode.ai) and [Claude](https://claude.ai) agents.

## What It Does

`agent-standby` prepares your environment so AI agents can work effectively:

1. **Syncs skills** — copies skill directories to the agent's config folder
2. **Copies config files** — copies agent configuration (AGENTS.md, opencode.jsonc, oh-my-openagent.json) from the local `configs/` directory
3. **Replaces env placeholders** — optionally replaces `{env:VAR}` placeholders in config files with actual values (from environment variables or interactive prompts)
4. **Sets environment variables** — exports paths for downstream CI steps

## Usage

### As a GitHub Action

```yaml
- name: Setup Agent
  uses: tee-labs/agent-standby@latest
```

With custom options:

```yaml
- name: Setup Agent
  uses: tee-labs/agent-standby@latest
  with:
    agent_type: claude     # or "opencode" (default)
    replace_env: true      # replace {env:VAR} placeholders in config files
```

### Local Usage

For local development, clone the repo and call the action entry point directly:

```bash
node src/action-entry.js
```

With env replacement enabled:

```bash
node src/action-entry.js --replace-env
```

## Inputs / Environment Variables

| Input | Environment Variable | Default | Description |
|-------|---------------------|---------|-------------|
| `agent_type` | `AGENT_TYPE` | `opencode` | `opencode` or `claude` |
| `skills_path` | `SKILLS_PATH` | `./skills` | Path to skills directory |
| `replace_env` | — | `false` | Replace `{env:VAR}` placeholders in config files (env var first, then interactive prompt) |

## Outputs (GitHub Action)

| Output | Description |
|--------|-------------|
| `config_dir` | Path to the agent config directory |
| `skills_dir` | Path to the synced skills directory |
| `agent_type` | The agent type that was configured |

## How It Works

```
┌─────────────────┐
│  Skills Source   │  ./skills/
│  (your repo)     │
└────────┬────────┘
         │ copy
         ▼
┌─────────────────┐
│  Agent Config    │  ~/.opencode/skills/  or  ~/.claude/skills/
│  Directory       │
└─────────────────┘

┌─────────────────┐
│  Local Configs   │  ./configs/
│  (your repo)     │  AGENTS.md, opencode.jsonc, oh-my-openagent.json
└────────┬────────┘
         │ copy
         ▼
┌─────────────────┐
│  Opencode Config │  ~/.config/opencode/
│  Directory       │
└─────────────────┘
```

### Env Placeholder Replacement

Config files in `configs/` can contain `{env:VAR_NAME}` placeholders (e.g., `{env:API_KEY}`). When `replace_env` is enabled, the action resolves each placeholder after copying:

1. **Environment variable** — checks `process.env[VAR_NAME]` first
2. **Interactive prompt** — falls back to prompting the user (allows empty input)

Source files in `configs/` are never modified — only the copied destination files are updated.

### Config Directory Mapping

| Agent Type | Config Directory |
|------------|-----------------|
| `opencode` | `~/.opencode/` |
| `claude` | `~/.claude/` |

## Project Structure

```
.
├── action.yml              # GitHub Action definition
├── package.json            # npm package
├── configs/                # Local agent config files (AGENTS.md, opencode.jsonc, oh-my-openagent.json)
├── src/
│   ├── action-entry.js     # GitHub Actions entry point (also for local use)
│   └── core/
│       └── setup.js        # Core logic: skills sync, config copy
├── skills/                 # Agent skills ecosystem
│   ├── pua/                # Core PUA skill (Chinese big-tech rhetoric)
│   ├── pua-en/             # English PIP (Western big-tech)
│   ├── pua-ja/             # Japanese 詰め culture
│   ├── p7/, p9/, p10/      # Role-based hierarchy skills
│   ├── pua-loop/           # Autonomous iterative development loop
│   ├── mama/               # Chinese mom nag mode
│   ├── yes/                # ENFP encouragement mode
│   ├── shot/               # Self-contained compressed PUA
│   ├── pro/                # Self-evolution + KPI + leaderboard
│   ├── review-changes/     # Code review skill
│   ├── explore-codebase/   # Codebase exploration skill
│   ├── debug-issue/        # Debug skill
│   └── refactor-safely/    # Refactor skill
├── .claude/skills/         # Claude-compatible skill mirrors
├── .github/workflows/
│   ├── opencode.yml        # OpenCode CI pipeline
│   └── release.yml         # Build + npm publish
└── dist/                   # ncc-bundled output for Action
```

## Skills

Skills are agent instruction sets synced to the config directory. This project ships a rich ecosystem:

### PUA Series (Motivational / Behavioral)

| Skill | Language | Description |
|-------|----------|-------------|
| `pua` | 🇨🇳 Chinese | Core PUA — 16 big-tech flavors, methodology router, 20+ reference files |
| `pua-en` | 🇬🇧 English | Western PIP — Amazon/Google/Meta/Netflix/Musk/Jobs flavors |
| `pua-ja` | 🇯🇵 Japanese | 詰め文化 — Toyota/Recruit/Dentsu/Mercari flavors |
| `shot` | 🇨🇳 Chinese | Self-contained compressed PUA (no dependencies) |
| `mama` | 🇨🇳 Chinese | Chinese mom nag mode |
| `yes` | 🇨🇳 Chinese | ENFP encouragement mode |
| `pro` | 🇨🇳 Chinese | Self-evolution + KPI tracking + leaderboard |
| `pua-loop` | 🇨🇳 Chinese | Autonomous iterative development loop |
| `p7`, `p9`, `p10` | 🇨🇳 Chinese | Role-based hierarchy (P7/P9/P10) |

### Knowledge Graph Skills (Code Review / Debug / Refactor)

| Skill | Purpose |
|-------|---------|
| `review-changes` | Risk-scored code review |
| `explore-codebase` | Architecture overview |
| `debug-issue` | Systematic debugging |
| `refactor-safely` | Safe refactoring |

## Development

```bash
# Install dependencies
npm install

# Build (bundles to dist/ via ncc)
npm run build
```

### Build

The project uses [`@vercel/ncc`](https://github.com/vercel/ncc) to bundle `src/action-entry.js` into a single `dist/index.js` file for the GitHub Action runtime. The `dist/` directory is committed to the repo (Action users need it).

### Release

Publishing is automated via GitHub Actions (`.github/workflows/release.yml`):

1. Push to `main` → builds `dist/`, commits back, tags `latest`
2. GitHub release published → triggers `npm publish`

## License

[MIT](./LICENSE)
