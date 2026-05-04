# agent-standby

[![npm](https://img.shields.io/npm/v/@mccxj/agent-standby)](https://www.npmjs.com/package/@mccxj/agent-standby)
[![GitHub Release](https://img.shields.io/github/v/release/mccxj/agent-standby)](https://github.com/mccxj/agent-standby/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Initialize AI agent configuration, environment variables, and skills for CI and local development. Supports [OpenCode](https://opencode.ai) and [Claude](https://claude.ai) agents.

## What It Does

`agent-standby` prepares your environment so AI agents can work effectively:

1. **Syncs skills** — copies skill directories to the agent's config folder
2. **Downloads config files** — fetches agent configuration (AGENTS.md, opencode.jsonc, oh-my-openagent.json) from GitHub Gists
3. **Sets environment variables** — exports paths for downstream CI steps

## Installation

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
    skills_path: ./skills  # path to your skills directory
```

### As a CLI

```bash
npx @mccxj/agent-standby
```

With options:

```bash
npx @mccxj/agent-standby --agent opencode --skills ./skills
npx @mccxj/agent-standby --agent claude --skills /path/to/skills
```

## Options

| Option | CLI Flag | Action Input | Default | Description |
|--------|----------|--------------|---------|-------------|
| Agent type | `-a, --agent` | `agent_type` | `opencode` | `opencode` or `claude` |
| Skills path | `-s, --skills` | `skills_path` | `./skills` | Path to skills directory |

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
│  GitHub Gists    │  AGENTS.md, opencode.jsonc, oh-my-openagent.json
│  (mccxj)         │
└────────┬────────┘
         │ download
         ▼
┌─────────────────┐
│  Opencode Config │  ~/.config/opencode/
│  Directory       │
└─────────────────┘
```

### Config Directory Mapping

| Agent Type | Config Directory |
|------------|-----------------|
| `opencode` | `~/.opencode/` |
| `claude` | `~/.claude/` |

## Project Structure

```
.
├── action.yml              # GitHub Action definition
├── package.json            # npm package (bin: agent-standby)
├── src/
│   ├── action-entry.js     # GitHub Actions entry point
│   ├── cli-entry.js        # CLI entry point (commander)
│   └── core/
│       └── setup.js        # Core logic: skills sync, gist download
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

# Run CLI locally
npx agent-standby
```

### Build

The project uses [`@vercel/ncc`](https://github.com/vercel/ncc) to bundle `src/action-entry.js` into a single `dist/index.js` file for the GitHub Action runtime. The `dist/` directory is committed to the repo (Action users need it) while `src/` is excluded from npm via `.npmignore`.

### Release

Publishing is automated via GitHub Actions (`.github/workflows/release.yml`):

1. Push to `main` → builds `dist/`, commits back, tags `latest`
2. GitHub release published → triggers `npm publish`

## License

[MIT](./LICENSE)
