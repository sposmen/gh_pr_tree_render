let Octokit;
(async function () {
  const OctokitBase = await import('@octokit/core')
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

// 60 Min cache
const cacheTime = 60*60*1000;

const getPRNodes = async ({ octokit, owner, repo }) => {
  const result = await (async () => {
    let nodes;
    const criteria = { owner, repo }
    const repoRecord = await Repo.findOrCreate(criteria, criteria);

    if(!repoRecord.nodes || (cacheTime + repoRecord.updatedAt < Date.now())){
      nodes = await octokit.graphql(QUERY, { owner, repo });
      await Repo.updateOne({ id: repoRecord.id }).set({ nodes });
    } else{
      nodes = repoRecord.nodes
    }
    return nodes
  })();
  return result.repository.pullRequests.nodes;
}

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

  fn: async function ({ owner, repo, branch }) {
    let nodes = null, errorMessage = null;
    const { value: githubToken } = await Config.findOne({ name: 'github_token' });
    const octokit = new Octokit({ auth: githubToken });
    try {
      nodes = await getPRNodes({ octokit, owner, repo });
    } catch (error) {
      errorMessage = error.message;
    }
    return { nodes, error: errorMessage };
  }
};
