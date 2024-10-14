import '@xyflow/react/dist/style.css';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import DownloadButton from "components/Pages/Tree/DownloadButton";
import branchDelimiter from "components/Pages/Tree/helpers/branchDelimiter";
import dagreSolver from "components/Pages/Tree/helpers/dagreSolver";
import nodeReducer from "components/Pages/Tree/helpers/nodeReducer";
import './styles/index.scss';
import { PRNode } from "components/Pages/Tree/PRNode";
import { useMemo } from "react";

const defaultViewport = { x: 0, y: 0, zoom: 1 };

export default function TreeRenderer({ rawNodes, branch }) {
  const { nodes: nodesToDelimit } = rawNodes.reduce(nodeReducer, { nodes: {}, edges: [] });
  // Delimit to branch
  const { nodes: dagreNodes, edges } = branchDelimiter(nodesToDelimit, branch)
  // Set dynamic tree postion
  const nodes = dagreSolver(dagreNodes, edges)

  const nodeTypes = useMemo(
    () => (
      {
        prNode: PRNode
      }
    ), []);

  return (
    <div id="app">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={defaultViewport}
        fitView
        defaultEdgeOptions={{ animated: true, type: 'smoothstep', }}
        attributionPosition="bottom-left"
        className="download-image"
        nodeTypes={nodeTypes}
      >
        <Controls />
        <Background gap={15} />
        <DownloadButton />
      </ReactFlow>
    </div>
  );
}
