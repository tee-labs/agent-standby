'use strict';

const path = require('path');
const core = require('@actions/core');
const { setup } = require('./core/setup');

async function run() {
  try {
    const agentType = core.getInput('agent_type') || 'opencode';
    const skillsPathInput = core.getInput('skills_path');
    const skillsPath = skillsPathInput
      ? skillsPathInput
      : path.join(__dirname, '..', 'skills');

    core.info(`Agent Standby: Setting up agent "${agentType}" with skills from "${skillsPath}"`);

    const result = await setup({ agentType, skillsPath });

    core.setOutput('config_dir', result.configDir);
    core.setOutput('skills_dir', result.skillsDestination);
    core.setOutput('agent_type', result.agentType);

    core.info(`Config directory: ${result.configDir}`);
    core.info(`Skills synced to: ${result.skillsDestination}`);
    core.info(`Opencode config: ${result.opencodeConfigDir}`);
    core.info(`Environment: ${result.isCI ? 'GitHub Actions' : 'Local'}`);

    core.info('Agent Standby setup completed successfully.');
  } catch (error) {
    core.setFailed(`Agent Standby failed: ${error.message}`);
  }
}

run();
