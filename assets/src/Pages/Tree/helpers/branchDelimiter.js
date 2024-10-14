const branchDelimiterIterator = (parent, firstCall = false) => {
  const { nodes, edges } = parent.children.reduce(
    ({ nodes, edges }, child) => {
      const { nodes: newNodes, edges: newEdges } = branchDelimiterIterator(child)
      return {
        nodes: [...nodes, ...newNodes],
        edges: [...edges, ...newEdges],
      }
    }, { nodes: [], edges: [] }
  )
  return {
    nodes: [parent, ...nodes],
    edges: [
      ...parent.edge ? [parent.edge] : [],
      ...edges
    ]
  }
}

const parentNodesWithEdges = (node)=>{
  let parent = node.parent ;
  const nodes = [];
  const edges = [];
  while (parent) {
    nodes.push(parent)
    if(parent.edge) edges.push(parent.edge);
    parent = parent.parent;
  }
  return { nodes, edges }
}

export default (nodes, branch) => {
  // Default result
  if (!branch) {
    return {
      nodes: Object.values(nodes),
      edges: Object.values(nodes).map((node) => node.edge).filter(n => n)
    }
  }
  const node = nodes[branch];
  // If no parent, nothing else to return than
  if (!node) return { nodes: [], edges: [] };

  const parentsData = parentNodesWithEdges(node)
  const childrenAndSelfData = branchDelimiterIterator(node, true);
  // Return the delimited tree
  return {
    nodes: [...parentsData.nodes, ...childrenAndSelfData.nodes],
    edges: [...parentsData.edges, ...childrenAndSelfData.edges],
  }
}
