const { getPRNodes, buildOctokit } = require('./index');

module.exports = {
  friendlyName: 'Tree data refresher',
  description: 'Force-refresh the PR cache for a repo.',

  inputs: {
    owner: {
      description: 'Github User',
      type: 'string',
      required: true
    },
    repo: {
      description: 'Github User Repository',
      type: 'string',
      required: true
    }
  },

  exits: {},

  fn: async function ({ owner, repo }) {
    const { octokit, error: tokenError } = await buildOctokit();
    if (tokenError) {
      return { nodes: null, error: tokenError };
    }
    let nodes = null; let errorMessage = null;
    try {
      nodes = await getPRNodes({ octokit, owner, repo, forceRefresh: true });
    } catch (error) {
      errorMessage = error.message;
    }
    return { nodes, error: errorMessage };
  }
};
