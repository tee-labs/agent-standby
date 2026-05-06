'use strict';

function getCore() {
  if (process.env.GITHUB_ACTIONS === 'true') {
    try {
      return require('@actions/core');
    } catch {
      return null;
    }
  }
  return null;
}

const core = getCore();

const logger = {
  info(msg) {
    if (core) {
      core.info(msg);
    } else {
      console.log(msg);
    }
  },

  warn(msg) {
    if (core) {
      core.warning(msg);
    } else {
      console.warn(msg);
    }
  },

  error(msg) {
    if (core) {
      core.error(msg);
    } else {
      console.error(msg);
    }
  },

  debug(msg) {
    if (core) {
      core.debug(msg);
    } else {
      console.log(`[debug] ${msg}`);
    }
  },

  setFailed(msg) {
    if (core) {
      core.setFailed(msg);
    } else {
      console.error(msg);
      process.exit(1);
    }
  },
};

module.exports = logger;
