import { useId } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BoxArrowInUpRight, Search } from "react-bootstrap-icons";
import { Link, useParams } from "react-router-dom";

const handleStyle = { left: 10 };
const reviewStatuses = {
  REVIEW_REQUIRED: { color: '#eab308', label: 'Review required' },
  APPROVED: { color: '#16a34a', label: 'Approved' },
  CHANGES_REQUESTED: { color: '#dc2626', label: 'Changes requested' },
};

export function PRNode({ data: node }) {
  const { owner, repo } = useParams();
  const {headRefName: branch} = node;
  const tooltipId = useId();
  const reviewers = new Map();
  for (const review of node.reviews?.nodes || []) {
    if (review.state !== 'PENDING') {
      reviewers.set(review.author?.login || 'Deleted user', review.state);
    }
  }
  const reviewLabels = {
    APPROVED: 'Approved',
    CHANGES_REQUESTED: 'Changes requested',
    COMMENTED: 'Commented',
    DISMISSED: 'Dismissed',
  };
  const status = node.isDraft
    ? { color: '#6b7280', label: 'Draft' }
    : reviewStatuses[node.reviewDecision] || { color: '#f97316', label: 'No review status' };
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={'pr-node'}>
        <span className="pr-status-container">
          <span
            className="pr-status-stripe nodrag"
            style={{ backgroundColor: status.color }}
            tabIndex={0}
            role="img"
            aria-label={status.label}
            aria-describedby={tooltipId}
          />
          <span className="pr-review-popover" role="tooltip" id={tooltipId}>
            <strong>{status.label}</strong>
            <span>Latest review per person</span>
            {!node.reviews
              ? <span>Refresh to load reviews.</span>
              : reviewers.size === 0
                ? <span>No submitted reviews.</span>
                : [...reviewers].map(([login, state]) => (
                  <span key={login}>
                    {state === 'APPROVED'
                      ? `Approved by @${login}`
                      : `@${login}: ${reviewLabels[state] || state}`}
                  </span>
                ))}
            {node.reviews?.pageInfo?.hasPreviousPage && (
              <span>Only the latest 100 reviews are included.</span>
            )}
          </span>
        </span>
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
