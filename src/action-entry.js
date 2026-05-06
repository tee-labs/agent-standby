'use strict';

const path = require('path');
const { setup } = require('./core/setup');

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
      core.info(`Agent Standby: Setting up agent "${agentType}" with skills from "${skillsPath}"`);
    } else {
      agentType = getArg(args, '--agent-type') || process.env.AGENT_TYPE || 'opencode';
      const skillsPathInput = getArg(args, '--skills-path') || process.env.SKILLS_PATH;
      skillsPath = skillsPathInput
        ? skillsPathInput
        : path.join(__dirname, '..', 'skills');
      replaceEnv = hasFlag(args, '--replace-env');
      console.log(`Agent Standby: Setting up agent "${agentType}" with skills from "${skillsPath}"`);
    }

    const result = await setup({ agentType, skillsPath, replaceEnv });

    if (isCI) {
      const core = require('@actions/core');
      core.setOutput('config_dir', result.configDir);
      core.setOutput('skills_dir', result.skillsDestination);
      core.setOutput('agent_type', result.agentType);
      core.info(`Config directory: ${result.configDir}`);
      core.info(`Skills synced to: ${result.skillsDestination}`);
      core.info(`Opencode config: ${result.opencodeConfigDir}`);
      core.info(`Environment: ${result.isCI ? 'GitHub Actions' : 'Local'}`);
      core.info('Agent Standby setup completed successfully.');
    } else {
      console.log(`Config directory: ${result.configDir}`);
      console.log(`Skills synced to: ${result.skillsDestination}`);
      console.log(`Opencode config: ${result.opencodeConfigDir}`);
      console.log(`Environment: ${result.isCI ? 'GitHub Actions' : 'Local'}`);
      console.log('Agent Standby setup completed successfully.');
    }
  } catch (error) {
    if (process.env.GITHUB_ACTIONS === 'true') {
      require('@actions/core').setFailed(`Agent Standby failed: ${error.message}`);
    } else {
      console.error(`Agent Standby failed: ${error.message}`);
      process.exit(1);
    }
  }
}

run();
