#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const { setup, VALID_AGENT_TYPES } = require('./core/setup');

const packageJson = require('../package.json');

const program = new Command();

program
  .name('agent-standby')
  .description('Initialize AI agent configuration, environment variables, and skills')
  .version(packageJson.version)
  .option(
    '-a, --agent <type>',
    `Agent type: ${VALID_AGENT_TYPES.join(' | ')}`,
    'opencode'
  )
  .option(
    '-s, --skills <path>',
    'Path to skills directory',
    './skills'
  )
  .action((options) => {
    try {
      const result = setup({
        agentType: options.agent,
        skillsPath: options.skills,
      });

      console.log('');
      console.log('✓ Agent Standby setup completed successfully.');
      console.log(`  Agent type:      ${result.agentType}`);
      console.log(`  Config directory: ${result.configDir}`);
      console.log(`  Skills source:    ${result.skillsSource}`);
      console.log(`  Skills synced:    ${result.skillsDestination}`);
      console.log(`  Environment:      ${result.isCI ? 'GitHub Actions' : 'Local'}`);
      console.log('');
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
