const position = { x: 0, y: 0 };
const style = {

};

const STATUS_BG = {
  MERGEABLE: '#aaf8bc',
  CONFLICTING: '#fddbdb',
  UNKNOWN: '#f8f3d1'
}

export default ({ nodes: oldNodes }, node) => {
  const parentData = oldNodes[node.baseRefName] || {
    id: node.baseRefName.replaceAll('.', '_'),
    position,
    style,
    targetPosition: 'top',
    sourcePosition: 'bottom',
    data: { label: node.baseRefName },
    headRefName: node.baseRefName,
    children: [],
  };

  // This also complements parentData if it comes from the PR nodes.
  const nodeData = Object.assign(
    oldNodes[node.headRefName] || { children: [] },
    {
      ...node,
      id: node.headRefName.replaceAll('.', '_'),
      position,
      style: {
        ...style,
        background: STATUS_BG[node.mergeable]
      },
      data: node,
      type: 'prNode',
      parent: parentData
    }
  );

  const edge = {
    id: `${parentData.id}-${nodeData.id}`,
    source: parentData.id,
    target: nodeData.id,
  }

  nodeData.edge = edge;

  parentData.children.push(nodeData)

  const nodes = {
    ...oldNodes,
    [node.headRefName]: nodeData,
    [node.baseRefName]: parentData
  }

  return { nodes }
}
