import { Handle, Position } from '@xyflow/react';

const handleStyle = { left: 10 };

export function PRNode({ data: node }) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={'pr-node'}>
        <a href={node.url} target={'_blank'}>
          {node.title}
          <br />
          &lt;{node.author?.login}&gt;
        </a>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  );
}
