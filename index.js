const dotenv = require('dotenv');
const result = dotenv.config()
if (result.error) throw result.error;

const graphviz = require('graphviz');

const { Octokit } = require('@octokit/core');

const QUERY = `query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    pullRequests(states: [OPEN], last: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        title
        headRefName
        baseRefName
        url
        mergeable
        author{login}
      }
    }
  }
}`

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN })

const STATUS_BG = {
  MERGEABLE: '#aaf8bc',
  CONFLICTING: '#fddbdb',
  UNKNOWN: '#f8f3d1'
}

const getPRNodes = async ({ owner, repo }) => {
  const result = await octokit.graphql(QUERY, { owner, repo });
  return result.repository.pullRequests.nodes;
}

let nodesData = {};

const g = graphviz.digraph("G");

const createNodeIfNotExist = (id, attr = {}) => (
  nodesData[id].node || g.addNode(id, Object.assign({}, attr))
);

const testValidation = new RegExp('^dependabot*');

const filterNode = (node) => {
  return !testValidation.test(node.headRefName)
}

const run = async () => {
  let nodes = await getPRNodes({ owner: process.env.GH_OWNER, repo: process.env.GH_REPO });

  nodes
    .filter(filterNode)
    .forEach((node) => {
      nodesData[node.headRefName] = node
      nodesData[node.baseRefName] = nodesData[node.baseRefName] ||
        {
          headRefName: node.baseRefName,
          title: node.baseRefName
          // baseRefName: ((node.baseRefName !== mainBranch) && mainBranch) || undefined
        }
    });

  Object.entries(nodesData).forEach(([key, value]) => {
    if (value.baseRefName === undefined) return;

    value.node = createNodeIfNotExist(
      value.headRefName,
      {
        label: `${value.title}\n${value.author.login}`,
        URL: value.url,
        fillcolor: STATUS_BG[value.mergeable]
      }
    );
    value.node.set( "style", "filled" );

    nodesData[value.baseRefName].node = createNodeIfNotExist(
      value.baseRefName,
      {
        label: `${nodesData[value.baseRefName].title}\n${nodesData[value.baseRefName].author?.login || ''}`,
        URL: nodesData[value.baseRefName].url,
        fillcolor: STATUS_BG[nodesData[value.baseRefName].mergeable]
      }
    );
    g.addEdge(
      value.baseRefName,
      value.headRefName,
    );
  })

  if (process.env.SHOW_DOT === 'true') {
    console.log(g.to_dot());
  }

  g.output("svg", `${process.env.GH_OWNER}.${process.env.GH_REPO}.pr_tree.svg`);
}

run().then(() => console.log('Processed'));
