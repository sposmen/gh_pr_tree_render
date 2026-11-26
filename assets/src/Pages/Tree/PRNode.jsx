import { Handle, Position } from '@xyflow/react';
import { BoxArrowInUpRight, Search } from "react-bootstrap-icons";
import { Link, useParams } from "react-router-dom";

const handleStyle = { left: 10 };
const reviewStatuses = {
  REVIEW_REQUIRED: { color: '#eab308', label: 'Revisión requerida' },
  APPROVED: { color: '#16a34a', label: 'Aprobado' },
  CHANGES_REQUESTED: { color: '#dc2626', label: 'Cambios solicitados' },
};

export function PRNode({ data: node }) {
  const { owner, repo } = useParams();
  const {headRefName: branch} = node;
  const status = node.isDraft
    ? { color: '#6b7280', label: 'Borrador' }
    : reviewStatuses[node.reviewDecision];
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={'pr-node'}>
        {status && (
          <span
            className="pr-status-stripe"
            style={{ backgroundColor: status.color }}
            title={status.label}
            role="img"
            aria-label={status.label}
          />
        )}
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
