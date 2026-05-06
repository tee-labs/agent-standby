'use strict';

const path = require('path');
const { setup } = require('./core/setup');
const logger = require('./core/logger');

function getArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return null;
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

async function run() {
  try {
    const args = process.argv.slice(2);
    const isCI = process.env.GITHUB_ACTIONS === 'true';

    let agentType, skillsPath, replaceEnv;

    if (isCI) {
      const core = require('@actions/core');
      agentType = core.getInput('agent_type') || 'opencode';
      const skillsPathInput = core.getInput('skills_path');
      skillsPath = skillsPathInput
        ? skillsPathInput
        : path.join(__dirname, '..', 'skills');
      replaceEnv = core.getBooleanInput('replace_env');
    } else {
      agentType = getArg(args, '--agent-type') || process.env.AGENT_TYPE || 'opencode';
      const skillsPathInput = getArg(args, '--skills-path') || process.env.SKILLS_PATH;
      skillsPath = skillsPathInput
        ? skillsPathInput
        : path.join(__dirname, '..', 'skills');
      replaceEnv = hasFlag(args, '--replace-env');
    }

    logger.info(`Agent Standby: Setting up agent "${agentType}" with skills from "${skillsPath}"`);

    const result = await setup({ agentType, skillsPath, replaceEnv });

    if (isCI) {
      const core = require('@actions/core');
      core.setOutput('config_dir', result.configDir);
      core.setOutput('skills_dir', result.skillsDestination);
      core.setOutput('agent_type', result.agentType);
    }

    logger.info(`Config directory: ${result.configDir}`);
    logger.info(`Skills synced to: ${result.skillsDestination}`);
    logger.info(`Opencode config: ${result.opencodeConfigDir}`);
    logger.info(`Environment: ${result.isCI ? 'GitHub Actions' : 'Local'}`);
    logger.info('Agent Standby setup completed successfully.');
  } catch (error) {
    logger.setFailed(`Agent Standby failed: ${error.message}`);
  }
}

run();
