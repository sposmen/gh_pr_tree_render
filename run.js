const dotenv = require('dotenv');
const result = dotenv.config()
const repositories = require('./repositories')
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

const DIRECTION = {
  UP: 'up',
  DOWN: 'down'
}

const getPRNodes = async ({ owner, repo }) => {
  const result = await octokit.graphql(QUERY, { owner, repo });
  return result.repository.pullRequests.nodes;
}

let g;
let nodesData;
let banned = []

const createNodeIfNotExist = (id, attr = {}) => (
  nodesData[id].node || (() => {
    const node = g.addNode(id, Object.assign({}, attr))
    node.set("style", "filled")
    return nodesData[id].node = node;
  })()
);

const testValidation = new RegExp('^dependabot*');

const filterNode = (node) => {
  // Some Clean up
  if (banned.includes(node.url)) {
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

const hierarchyLineProcessor = (node, nodeProcessor, direction = null) => {
  nodeProcessor(node)
  if (direction === null || direction === DIRECTION.DOWN) {
    node.children.forEach((child) => hierarchyLineProcessor(child, nodeProcessor, DIRECTION.DOWN))
  }
  if ((direction === null || direction === DIRECTION.UP) && node.parent) {
    hierarchyLineProcessor(node.parent, nodeProcessor, DIRECTION.UP)
  }
}

const run = async ({ owner, repo, ignored, mainBranch }) => {
  let nodes = await getPRNodes({ owner, repo });
  const filename = `${owner}.${repo}.pr_tree.svg`

  banned = ignored;
  nodesData = {}

  nodes
    .filter(filterNode)
    .forEach((node) => {
      const parentData = {
        ...nodesData[node.baseRefName] || {
          headRefName: node.baseRefName,
          title: node.baseRefName,
          children: [],
        }
      };

      const nodeData = {
        ...nodesData[node.headRefName] || {
          children: [],
          parent: parentData
        },
        ...node,
      };

      parentData.children.push(nodeData)

      nodesData = {
        ...nodesData,
        [node.headRefName]: nodeData,
        [node.baseRefName]: parentData
      }

      let edge = [node.baseRefName, node.headRefName];
      if (process.env.UP_DOWN === 'true') {
        edge = edge.reverse()
      } else {
        edge.push({ dir: 'back' })
      }
      nodesData[node.headRefName].edge = edge;
    });

  const nodeProcessor = (value) => {
    if (value.edge) {
      g.addEdge.apply(g, value.edge);
    }
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

    const baseLabel = `${nodesData[value.baseRefName].title} <${nodesData[value.baseRefName].author?.login || ''}>`
    nodesData[value.baseRefName].node = createNodeIfNotExist(
      value.baseRefName,
      {
        label: maxCharsLine(baseLabel),
        URL: nodesData[value.baseRefName].url,
        fillcolor: STATUS_BG[nodesData[value.baseRefName].mergeable]
      }
    );
  }

  const baseNode = nodesData[mainBranch];
  g = graphviz.digraph("G");

  if (baseNode) {
    // Render hierarchy for the selected branch
    hierarchyLineProcessor(baseNode, nodeProcessor)
  } else {
    // Render all branches except ignored
    console.log("Note: No mainBranch found");
    Object.entries(nodesData).forEach(([_k, value]) => nodeProcessor(value));
  }

  if (process.env.SHOW_DOT === 'true') console.log(g.to_dot());
  if (banned.length) console.log(banned, ' banned already removed');

  g.output("svg", `graphs/${filename}`);
}

Object.entries(repositories).forEach(([owner, repos]) => {
  Object.entries(repos).forEach(([repo, { ignored, mainBranch }]) => {
    run({ owner, repo, ignored, mainBranch }).then(() => console.log(`Processed ${repo}`));
  })
})
