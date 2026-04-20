let Octokit;
(async function () {
  const OctokitBase = await import('@octokit/core');
  Octokit = OctokitBase.Octokit;
})();

// language=GRAPHQL
const QUERY = `query ($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    pullRequests(
      states: [OPEN]
      last: 100
      orderBy: { field: CREATED_AT, direction: DESC }
    ) {
      nodes {
        title
        headRefName
        baseRefName
        url
        number
        isDraft
        mergeable
        author {
          login
        }
        labels(first: 10) {
          nodes {
            color
            name
          }
        }
        reviewDecision
      }
    }
  }
}
`;

// 30 Min cache
const cacheTime = 30*60*1000;

const fetchAndStorePRNodes = async ({ octokit, owner, repo, repoRecord }) => {
  const nodes = await octokit.graphql(QUERY, { owner, repo });
  await Repo.updateOne({ id: repoRecord.id }).set({ nodes });
  return nodes;
};

const getPRNodes = async ({ octokit, owner, repo, forceRefresh = false }) => {
  const criteria = { owner, repo };
  const repoRecord = await Repo.findOrCreate(criteria, criteria);

  let nodes;
  if (forceRefresh || !repoRecord.nodes || (cacheTime + repoRecord.updatedAt < Date.now())) {
    nodes = await fetchAndStorePRNodes({ octokit, owner, repo, repoRecord });
  } else {
    nodes = repoRecord.nodes;
  }
  return nodes.repository.pullRequests.nodes;
};

const buildOctokit = async () => {
  const configRecord = await Config.findOne({ name: 'github_token' });
  if (!configRecord) {
    return { error: 'GitHub token is not configured. Please set it in the Config page.' };
  }
  return { octokit: new Octokit({ auth: configRecord.value }) };
};

module.exports = {
  friendlyName: 'Tree data retriever',
  description: 'Index repo.',

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
    },
    branch: {
      description: 'Github Repository Branch',
      type: 'string',
      required: false
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
      nodes = await getPRNodes({ octokit, owner, repo });
    } catch (error) {
      errorMessage = error.message;
    }
    return { nodes, error: errorMessage };
  }
};

module.exports.getPRNodes = getPRNodes;
module.exports.buildOctokit = buildOctokit;
