let Octokit;
(async function () {
  const OctokitBase = await import('@octokit/core');
  Octokit = OctokitBase.Octokit;
})();

// language=GRAPHQL
const QUERY = `query {
  viewer {
    login
    avatarUrl
    organizations(first: 100) {
      nodes {
        login
        avatarUrl
      }
    }
  }
}`;

module.exports = {
  friendlyName: 'Owners list',
  description: 'List the authenticated user and their organizations.',

  inputs: {},

  exits: {},

  fn: async function () {
    const savedOwners = await Owner.find().sort('login ASC');
    const configRecord = await Config.findOne({ name: 'github_token' });
    if (!configRecord) {
      return {
        viewer: null,
        organizations: [],
        savedOwners,
        error: 'GitHub token is not configured. Please set it in the Config page.'
      };
    }
    const octokit = new Octokit({ auth: configRecord.value });
    try {
      const { viewer } = await octokit.graphql(QUERY);
      return {
        viewer: { login: viewer.login, avatarUrl: viewer.avatarUrl },
        organizations: viewer.organizations.nodes,
        savedOwners,
        error: null
      };
    } catch (error) {
      return { viewer: null, organizations: [], savedOwners, error: error.message };
    }
  }
};
