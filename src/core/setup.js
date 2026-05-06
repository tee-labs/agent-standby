'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execSync } = require('child_process');
const logger = require('./logger');

const ENV_PLACEHOLDER_PATTERN = /\{env:([^}]+)\}/g;

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
  logger.info(`process.env.HOME is ${process.env.HOME}`);
  logger.info(`process.env.USERPROFILE is ${process.env.USERPROFILE}`);
  logger.info(`process.env.HOMEDRIVE is ${process.env.HOMEDRIVE}`);
  logger.info(`process.env.HOMEPATH is ${process.env.HOMEPATH}`);
  logger.info(`os.homedir() is ${os.homedir()}`);
  // if (process.env.HOME) return process.env.HOME;
  // if (process.env.USERPROFILE) return process.env.USERPROFILE;
  // if (process.env.HOMEDRIVE && process.env.HOMEPATH) {
  //   return process.env.HOMEDRIVE + process.env.HOMEPATH;
  // }
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

async function writeOpencodeConfig(configDir, replaceEnv = false) {
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

    if (replaceEnv) {
      await replaceEnvPlaceholders(destPath);
    }
  }
}

function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function replaceEnvPlaceholders(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.matchAll(ENV_PLACEHOLDER_PATTERN);
  const seen = new Set();

  for (const match of matches) {
    const varName = match[1];
    if (seen.has(varName)) continue;
    seen.add(varName);

    let value = process.env[varName];
    if (value === undefined || value === '') {
      const answer = await promptUser(
        `Enter value for ${varName} (leave empty to skip): `
      );
      value = answer;
    }

    const placeholder = `{env:${varName}}`;
    content = content.split(placeholder).join(value);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
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
  const replaceEnv = options.replaceEnv === true;

  const skillsBaseDir = agentType === 'opencode'
    ? path.join(getHomeDir(), OPENCODE_CONFIG_DIR_NAME)
    : configDir;
  const skillsDest = path.join(skillsBaseDir, 'skills');

  fs.mkdirSync(configDir, { recursive: true });
  copyDirectory(skillsPath, skillsDest);

  const opencodeConfigDir = path.join(getHomeDir(), OPENCODE_CONFIG_DIR_NAME);
  await writeOpencodeConfig(opencodeConfigDir, replaceEnv);

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
  replaceEnvPlaceholders,
  copyDirectory,
  ensureContextMode,
  VALID_AGENT_TYPES,
  AGENT_CONFIG_DIRS,
  OPENCODE_CONFIG_DIR_NAME,
  CONFIG_FILES,
  getLocalConfigDir,
};
