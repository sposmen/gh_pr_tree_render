import { Handle, Position } from '@xyflow/react';
import { BoxArrowInUpRight, Search } from "react-bootstrap-icons";
import { Link, useParams } from "react-router-dom";

const handleStyle = { left: 10 };

export function PRNode({ data: node }) {
  const { owner, repo } = useParams();
  const {headRefName: branch} = node;
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={'pr-node'}>
        {node.title}&nbsp;
        <Link to={`/tree/${owner}/${repo}/${branch}`} reloadDocument>
          <Search/>
        </Link>&nbsp;
        <a href={node.url} target={'_blank'}>
          <BoxArrowInUpRight />
        </a>
        <br />
        &lt;{node.author?.login}&gt;
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
