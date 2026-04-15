let Octokit;
(async function () {
  const OctokitBase = await import('@octokit/core');
  Octokit = OctokitBase.Octokit;
})();

const PAGE_SIZE = 30;

// language=GRAPHQL
const QUERY = `query ($owner: String!, $after: String, $first: Int!) {
  repositoryOwner(login: $owner) {
    login
    ... on User {
      repositories(
        first: $first
        after: $after
        ownerAffiliations: OWNER
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes { name url isPrivate description }
        pageInfo { hasNextPage endCursor }
      }
    }
    ... on Organization {
      repositories(
        first: $first
        after: $after
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes { name url isPrivate description }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}`;

module.exports = {
  friendlyName: 'Owner repositories',
  description: 'List repositories for a given owner (user or organization) with cursor pagination.',

  inputs: {
    owner: {
      description: 'Github owner login (user or organization)',
      type: 'string',
      required: true
    },
    after: {
      description: 'GraphQL cursor for the next page',
      type: 'string',
      required: false
    }
  },

  exits: {},

  fn: async function ({ owner, after }) {
    const configRecord = await Config.findOne({ name: 'github_token' });
    if (!configRecord) {
      return { owner, repositories: [], pageInfo: null, error: 'GitHub token is not configured. Please set it in the Config page.' };
    }
    const octokit = new Octokit({ auth: configRecord.value });
    try {
      const result = await octokit.graphql(QUERY, {
        owner,
        after: after || null,
        first: PAGE_SIZE
      });
      const ownerData = result.repositoryOwner;
      if (!ownerData) {
        return { owner, repositories: [], pageInfo: null, error: `Owner '${owner}' not found.` };
      }
      return {
        owner: ownerData.login,
        repositories: ownerData.repositories.nodes,
        pageInfo: ownerData.repositories.pageInfo,
        error: null
      };
    } catch (error) {
      return { owner, repositories: [], pageInfo: null, error: error.message };
    }
  }
};
