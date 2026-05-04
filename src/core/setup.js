'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const VALID_AGENT_TYPES = ['opencode', 'claude'];

const AGENT_CONFIG_DIRS = {
  opencode: '.opencode',
  claude: '.claude',
};

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

function setup(options = {}) {
  const agentType = normalizeAgentType(options.agentType);
  const skillsPath = resolveSkillsPath(options.skillsPath);
  const configDir = resolveConfigDir(agentType);
  const skillsDest = path.join(configDir, 'skills');

  fs.mkdirSync(configDir, { recursive: true });
  copyDirectory(skillsPath, skillsDest);
  writeAgentConfig(configDir, agentType);

  const result = {
    agentType,
    configDir,
    skillsSource: skillsPath,
    skillsDestination: skillsDest,
    isCI: isGitHubActions(),
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
  copyDirectory,
  VALID_AGENT_TYPES,
  AGENT_CONFIG_DIRS,
};
