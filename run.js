import { config } from 'dotenv';
import graphviz from 'graphviz';
import { Octokit } from '@octokit/core';

import repositories from './repositories.js';

const result = config();
if (result.error) throw result.error;

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
  const result = await (async () => {
    getPRNodes[owner] = getPRNodes[owner] || {};
    getPRNodes[owner][repo] = getPRNodes[owner][repo] || await octokit.graphql(QUERY, { owner, repo });
    return getPRNodes[owner][repo]
  })();
  return result.repository.pullRequests.nodes;
}

let g;
let nodesData;
let banned = []

const createNodeIfNotExist = (id, attr = {}) => (
  nodesData[id].node || (() => {
    const node = g.addNode(id, Object.assign({}, attr))
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

const maxCharsLine = (string, chars = 45) => {
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
  const filename = `${owner}.${repo}.${mainBranch}.pr_tree.html`

  banned = ignored;
  nodesData = {}

  nodes
    .filter(filterNode)
    .forEach((node) => {
      const parentData = nodesData[node.baseRefName] || {
        headRefName: node.baseRefName,
        title: node.baseRefName,
        children: [],
      };

      // This also complements parentData if it comes from the PR nodes.
      const nodeData = Object.assign(
        nodesData[node.headRefName] || { children: [] },
        {
          ...node,
          parent: parentData
        }
      );

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

    const headLabel = `${maxCharsLine(value.title)}\n<${value.author.login}>`;
    value.node = createNodeIfNotExist(
      value.headRefName,
      {
        label: headLabel,
        URL: value.url,
        fillcolor: STATUS_BG[value.mergeable]
      }
    );

    const baseLabel = `${maxCharsLine(nodesData[value.baseRefName].title)}\n<${nodesData[value.baseRefName].author?.login || ''}>`
    nodesData[value.baseRefName].node = createNodeIfNotExist(
      value.baseRefName,
      {
        label: baseLabel,
        URL: nodesData[value.baseRefName].url,
        fillcolor: STATUS_BG[nodesData[value.baseRefName].mergeable]
      }
    );
  }

  const baseNode = nodesData[mainBranch];
  g = graphviz.digraph(mainBranch);
  g.setNodeAttribut('style', 'rounded,filled')
  g.setNodeAttribut('shape', 'box')
  g.setNodeAttribut('target', '_blank')
  g.setNodeAttribut('fontname', 'Courier');

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
  Object.entries(repos).forEach(([repo, hierarchies]) => {
    hierarchies.forEach(({ ignored, mainBranch })=>{
      run({ owner, repo, ignored, mainBranch }).then(() => console.log(`Processed ${repo}: ${mainBranch}`));
    })
  })
})
