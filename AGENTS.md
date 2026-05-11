# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-11

## OVERVIEW

`@mccxj/agent-standby` — GitHub Action that initializes AI agent configuration (OpenCode/Claude), syncs skills directories, copies plugins, and downloads config files. Ships as a npm-packaged GitHub Action (`action.yml`).

## STRUCTURE

```
.
├── action.yml          # GitHub Action definition (node20, dist/index.js)
├── package.json        # npm package (@mccxj/agent-standby)
├── .opencode.json      # MCP server config (code-review-graph)
├── configs/            # Local agent config files (AGENTS.md, opencode.jsonc, oh-my-openagent.json)
│   └── AGENTS.md       # ⚠ Deployed config template — NOT a codebase knowledge file
├── plugins/            # OpenCode plugins (synced to ~/.opencode/plugins/)
│   └── rtk.ts          # Bash/shell tool rewriter via `rtk rewrite`
├── src/
│   ├── action-entry.js # GitHub Actions entry (@actions/core), also for local use (70 lines)
│   └── core/
│       ├── setup.js    # Core logic: agent config, skills sync, plugins sync, config copy (232 lines)
│       └── logger.js   # Dual logger: CI (@actions/core) / local (console) (59 lines)
├── skills/             # Agent skills ecosystem (PUA, review, explore, debug, refactor)
│   ├── pua/            # Core PUA skill + references (Chinese big-tech rhetoric)
│   ├── pua-en/         # English PIP (Western big-tech performance culture)
│   ├── pua-ja/         # Japanese 詰め (Japanese corporate culture)
│   ├── p7/, p9/, p10/  # Role-based sub-skills (P7/P9/P10 hierarchy)
│   ├── pua-loop/       # Autonomous iterative development loop
│   ├── mama/           # Chinese mom nag mode (flavor variant)
│   ├── yes/            # ENFP encouragement mode (flavor variant)
│   ├── shot/           # Self-contained compressed PUA (182 lines)
│   ├── pro/            # Self-evolution + KPI + leaderboard
│   ├── playwright-cli/ # Browser automation via Playwright MCP
│   ├── review-changes/ # Code review skill (knowledge graph)
│   ├── explore-codebase/ # Codebase exploration skill (knowledge graph)
│   ├── debug-issue/    # Debug skill (knowledge graph)
│   └── refactor-safely/ # Refactor skill (knowledge graph)
├── .claude/skills/     # Claude-compatible copies of review/explore/debug/refactor
├── .github/workflows/
│   ├── opencode.yml    # OpenCode CI (issue_comment trigger, concurrency per PR/issue)
│   └── release.yml     # Build + npm publish on release (commits dist/ back, tags latest)
└── dist/               # ncc-bundled output (committed, not in .gitignore)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/modify skills | `skills/<name>/SKILL.md` | Each skill has frontmatter (name, description, license) |
| Change Action behavior | `src/action-entry.js` | Uses @actions/core, reads `agent_type` + `replace_env` inputs |
| Core setup logic | `src/core/setup.js` | Config dir resolution, skills copy, plugins copy, config copy, env vars |
| Logging | `src/core/logger.js` | Dual logger — auto-detects CI vs local |
| Add config file downloads | `src/core/setup.js` → `CONFIG_FILES` | Array of `{filename}` copied from `configs/` directory |
| Add/modify plugins | `plugins/<name>.ts` | Synced to `~/.opencode/plugins/` by `getLocalPluginsDir()` |
| CI pipeline | `.github/workflows/opencode.yml` | Triggers on `/oc` comment, installs code-review-graph |
| Release pipeline | `.github/workflows/release.yml` | Builds dist/, commits dist/ back, tags latest, publishes to npm |

## ACTION INPUTS

| Input | Default | Purpose |
|-------|---------|---------|
| `agent_type` | `opencode` | Which agent config to set up (`opencode` or `claude`) |
| `replace_env` | `false` | Whether to replace `${ENV_VAR}` placeholders in config files |
| `lsp_java` | `false` | Install Java 21 + jdtls for Java LSP |
| `install_rtk` | `true` | Install rtk (Rust tool registry) |
| `install_crg` | `true` | Install code-review-graph (Python 3.10) |
| `git_identity` | `true` | Configure git user.name/email for the repo |

## CONVENTIONS

- **Node.js ≥18**, CommonJS (`require()`) throughout — TypeScript only in `plugins/`
- **Build**: `ncc build src/action-entry.js -o dist` — bundles to single file for Action
- **npm publish**: `dist/` is committed (needed for Action users)
- **Skills**: Each has YAML frontmatter with `name`, `description`, `license: MIT`
- **Skills sync**: Copied to `~/.config/opencode/skills/` or `~/.claude/skills/` based on agent type
- **Plugins sync**: `plugins/` directory copied to `~/.opencode/plugins/` (opencode only)
- **Config dirs**: opencode → `~/.opencode/`, claude → `~/.claude/`
- **Config files**: Copied from `configs/` directory to `~/.config/opencode/`
- **Context-mode**: `ensureContextMode()` in setup.js — installs context-mode MCP if missing
- **No linter/formatter** — no eslint, prettier, or .editorconfig configured
- **No test framework** — no test infrastructure exists

## ANTI-PATTERNS

- Don't add dependencies lightly — this is a lightweight setup tool
- Don't edit `dist/` directly — it's auto-generated by `ncc`
- Don't skip `npm run build` before testing Action changes
- Don't commit `.code-review-graph/` — it's in `.gitignore`
- Don't treat `configs/AGENTS.md` as a codebase knowledge file — it's a deployed config template

## COMMANDS

```bash
npm install       # install deps + runs build (prepare script)
npm run build     # ncc bundle → dist/
```

## GOTCHAS

- `dist/` is committed to repo (Action users need it)
- `release.yml` commits `dist/` back to the repo after build + force-tags `latest`
- `.claude/skills/` mirrors `skills/` for Claude compatibility — keep in sync
- `writeAgentConfig()` in setup.js is commented out — config comes from local `configs/` directory
- `skills/pua/references/` has 20+ methodology files — only read when PUA skill is active
- `configs/AGENTS.md` is a deployed user-facing config (output protocol + context-mode rules), NOT a codebase guide
- `prepare` script runs `npm run build` on `npm install` — builds happen automatically

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
