# SKILLS — Agent Skills Ecosystem

## OVERVIEW

Skills directory with YAML frontmatter (`name`, `description`, `license: MIT`). Synced to `~/.opencode/skills/` or `~/.claude/skills/` during setup. `.claude/skills/` is a Claude-compatible mirror of the 4 knowledge-graph skills.

## SKILL CATEGORIES

### PUA Series (motivational/behavioral)

| Skill | Language | Description |
|-------|----------|-------------|
| `pua/` | 🇨🇳 Chinese | Core PUA — 16 big-tech flavors, methodology router, 20+ reference files |
| `pua-en/` | 🇬🇧 English | Western PIP — Amazon/Google/Meta/Netflix/Musk/Jobs flavors |
| `pua-ja/` | 🇯🇵 Japanese | 詰め文化 — Toyota/Recruit/Dentsu/Mercari flavors |
| `shot/` | 🇨🇳 Chinese | Self-contained compressed PUA (182 lines, no dependencies) |
| `mama/` | 🇨🇳 Chinese | Chinese mom nag mode — flavor variant |
| `yes/` | 🇨🇳 Chinese | ENFP encouragement mode — flavor variant |
| `pro/` | 🇨🇳 Chinese | Self-evolution + KPI + leaderboard platform |
| `pua-loop/` | 🇨🇳 Chinese | Autonomous iterative development loop with Oracle gate |
| `p7/`, `p9/`, `p10/` | 🇨🇳 Chinese | Role-based hierarchy (P7 senior/P9 tech-lead/P10 CTO) |

### Tool Skills (browser automation)

| Skill | Description |
|-------|-------------|
| `playwright-cli/` | Browser automation via Playwright MCP — web testing, scraping, screenshots |

### Knowledge Graph Skills (code review/debug/refactor)

| Skill | Purpose |
|-------|---------|
| `review-changes/` | Risk-scored code review via `detect_changes` + `get_impact_radius` |
| `explore-codebase/` | Architecture overview via `list_communities` + `semantic_search_nodes` |
| `debug-issue/` | Systematic debugging via `query_graph` call chain tracing |
| `refactor-safely/` | Safe refactoring via `refactor_tool` (rename/dead-code/suggest) |

## STRUCTURE

Each skill: `SKILL.md` with YAML frontmatter. PUA core has `references/` subdirectory (20+ methodology files). Flat `.md` files at `skills/` root are skill stubs (not yet migrated to directories).

## CONVENTIONS

- Every `SKILL.md` starts with YAML frontmatter: `name`, `description`, `license: MIT`
- PUA references: only load when PUA skill is active (20+ files, expensive)
- `.claude/skills/` mirrors the 4 knowledge-graph skills — keep in sync with `skills/`
- Add new skills: create `skills/<name>/SKILL.md` with frontmatter
- `playwright-cli/` is the only non-PUA, non-knowledge-graph skill category
