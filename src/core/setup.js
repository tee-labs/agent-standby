'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const VALID_AGENT_TYPES = ['opencode', 'claude'];

const AGENT_CONFIG_DIRS = {
  opencode: '.opencode',
  claude: '.claude',
};

const OPENCODE_CONFIG_DIR_NAME = '.config/opencode';

const CONFIG_FILES = [
  { filename: 'AGENTS.md' },
  { filename: 'opencode.jsonc' },
  { filename: 'oh-my-openagent.json' },
];

function getLocalConfigDir() {
  return path.join(__dirname, '..', '..', 'configs');
}

function resolveConfigDir(agentType) {
  const home = getHomeDir();
  const dirName = AGENT_CONFIG_DIRS[agentType];
  return path.join(home, dirName);
}

function getHomeDir() {
  if (process.env.HOME) return process.env.HOME;
  if (process.env.USERPROFILE) return process.env.USERPROFILE;
  if (process.env.HOMEDRIVE && process.env.HOMEPATH) {
    return process.env.HOMEDRIVE + process.env.HOMEPATH;
  }
  return os.homedir();
}

function isGitHubActions() {
  return process.env.GITHUB_ACTIONS === 'true';
}

function normalizeAgentType(agentType) {
  const normalized = (agentType || 'opencode').trim().toLowerCase();
  if (!VALID_AGENT_TYPES.includes(normalized)) {
    throw new Error(
      `Invalid agent type: "${agentType}". Valid types: ${VALID_AGENT_TYPES.join(', ')}`
    );
  }
  return normalized;
}

function resolveSkillsPath(skillsPath) {
  const resolved = path.resolve(skillsPath || './skills');
  if (!fs.existsSync(resolved)) {
    throw new Error(`Skills path does not exist: ${resolved}`);
  }
  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    throw new Error(`Skills path is not a directory: ${resolved}`);
  }
  return resolved;
}

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function writeAgentConfig(configDir, agentType) {
  fs.mkdirSync(configDir, { recursive: true });

  if (agentType === 'opencode') {
    const configPath = path.join(configDir, 'opencode.json');
    const config = {
      $schema: 'https://opencode.ai/config.json',
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } else if (agentType === 'claude') {
    const configPath = path.join(configDir, 'settings.json');
    const config = {};
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }
}

function writeGitHubEnv(envVars) {
  const githubEnv = process.env.GITHUB_ENV;
  if (!githubEnv) {
    return;
  }

  const lines = [];
  for (const [key, value] of Object.entries(envVars)) {
    lines.push(`${key}=${value}`);
  }

  fs.appendFileSync(githubEnv, lines.join(os.EOL) + os.EOL, 'utf-8');
}

function writeOpencodeConfig(configDir) {
  fs.mkdirSync(configDir, { recursive: true });

  for (const file of CONFIG_FILES) {
    const srcPath = path.join(getLocalConfigDir(), file.filename);
    const destPath = path.join(configDir, file.filename);
    if (!fs.existsSync(srcPath)) {
      throw new Error(
        `Local config file not found: ${srcPath}`
      );
    }
    fs.copyFileSync(srcPath, destPath);
  }
}

function ensureContextMode() {
  try {
    execSync('context-mode --version', { stdio: 'pipe' });
    return { installed: true, method: 'existing' };
  } catch {}

  try {
    execSync('npm install -g context-mode', { stdio: 'inherit' });
    return { installed: true, method: 'npm-global' };
  } catch (err) {
    return { installed: false, error: err.message };
  }
}

async function setup(options = {}) {
  const agentType = normalizeAgentType(options.agentType);
  const skillsPath = resolveSkillsPath(options.skillsPath);
  const configDir = resolveConfigDir(agentType);

  const skillsBaseDir = agentType === 'opencode'
    ? path.join(getHomeDir(), OPENCODE_CONFIG_DIR_NAME)
    : configDir;
  const skillsDest = path.join(skillsBaseDir, 'skills');

  fs.mkdirSync(configDir, { recursive: true });
  copyDirectory(skillsPath, skillsDest);
  //writeAgentConfig(configDir, agentType);

  const opencodeConfigDir = path.join(getHomeDir(), OPENCODE_CONFIG_DIR_NAME);
  writeOpencodeConfig(opencodeConfigDir);

  const contextMode = ensureContextMode();

  const result = {
    agentType,
    configDir,
    skillsSource: skillsPath,
    skillsDestination: skillsDest,
    opencodeConfigDir,
    isCI: isGitHubActions(),
    contextMode,
  };

  if (isGitHubActions()) {
    writeGitHubEnv({
      AGENT_STANDBY_CONFIG_DIR: configDir,
      AGENT_STANDBY_AGENT_TYPE: agentType,
      AGENT_STANDBY_SKILLS_DIR: skillsDest,
    });
  }

  return result;
}

module.exports = {
  setup,
  resolveConfigDir,
  resolveSkillsPath,
  normalizeAgentType,
  isGitHubActions,
  writeGitHubEnv,
  writeOpencodeConfig,
  copyDirectory,
  ensureContextMode,
  VALID_AGENT_TYPES,
  AGENT_CONFIG_DIRS,
  OPENCODE_CONFIG_DIR_NAME,
  CONFIG_FILES,
  getLocalConfigDir,
};
