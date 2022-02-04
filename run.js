const dotenv = require('dotenv');
const result = dotenv.config()
const repos = require('./repos')
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

let g;
let nodesData;
let banned = []

const createNodeIfNotExist = (id, attr = {}) => (
  nodesData[id].node || g.addNode(id, Object.assign({}, attr))
);

const testValidation = new RegExp('^dependabot*');

const filterNode = (node) => {
  // Some Clean up
  if(banned.includes(node.url)){
    banned = banned.filter(item => item !== node.url)
    return false;
  }

  return !testValidation.test(node.headRefName)
}

const maxCharsLine = (string, chars = 35) => {
  const wsLookup = 15; // Look backwards n characters for a whitespace
  const regex = new RegExp(String.raw`\s*(?:(\S{${chars}})|([\s\S]{${chars - wsLookup},${chars}})(?!\S))`, 'g');
  return string.replace(regex, (_, x, y) => x ? `${x}-\n` : `${y}\n`)
}

const run = async (repo, ignored) => {
  let nodes = await getPRNodes({ owner: process.env.GH_OWNER, repo });

  g = graphviz.digraph("G");
  banned = ignored;
  nodesData = {}

  nodes
    .filter(filterNode)
    .forEach((node) => {
      nodesData[node.headRefName] = node
      nodesData[node.baseRefName] = nodesData[node.baseRefName] ||
        {
          headRefName: node.baseRefName,
          title: node.baseRefName
          // baseRefName: ((node.baseRefName !== mainBranch) && mainBranch) || undefined
        };

      let edge = [node.baseRefName, node.headRefName];
      if (process.env.UP_DOWN === 'true') {
        edge = edge.reverse()
      } else {
        edge.push({ dir: 'back' })
      }
      g.addEdge.apply(g, edge);
    });

  Object.entries(nodesData).forEach(([key, value]) => {
    if (value.baseRefName === undefined) return;

    const headLabel = `${value.title} <${value.author.login}>`;
    value.node = createNodeIfNotExist(
      value.headRefName,
      {
        label: maxCharsLine(headLabel),
        URL: value.url,
        fillcolor: STATUS_BG[value.mergeable]
      }
    );
    value.node.set("style", "filled");

    const baseLabel = `${nodesData[value.baseRefName].title} <${nodesData[value.baseRefName].author?.login || ''}>`
    nodesData[value.baseRefName].node = createNodeIfNotExist(
      value.baseRefName,
      {
        label: maxCharsLine(baseLabel),
        URL: nodesData[value.baseRefName].url,
        fillcolor: STATUS_BG[nodesData[value.baseRefName].mergeable]
      }
    );
  })

  if (process.env.SHOW_DOT === 'true') {
    console.log(g.to_dot());
  }
  if(banned.length){
    console.log(banned, ' banned already removed')
  }
  g.output("svg", `graphs/${process.env.GH_OWNER}.${repo}.pr_tree.svg`);
}

Object.entries(repos).forEach(([repo, {ignored}])=>{
  run(repo, ignored).then(() => console.log(`Processed ${repo}`));
})
