import React, { useState } from 'react';
import axios from 'axios';
import { ArrowClockwise } from 'react-bootstrap-icons';
import { useParams, useRevalidator } from 'react-router-dom';

function RefreshButton() {
  const { owner, repo } = useParams();
  const revalidator = useRevalidator();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onClick = async () => {
    if (isRefreshing || !owner || !repo) return;
    setIsRefreshing(true);
    try {
      await axios.post(`/api/v1/tree/${owner}/${repo}/refresh`);
      revalidator.revalidate();
    } finally {
      setIsRefreshing(false);
    }
  };

  const spinning = isRefreshing || revalidator.state === 'loading';

  return (
    <button
      className="tree-action-btn"
      onClick={onClick}
      disabled={spinning}
      title="Refresh PR data"
    >
      <ArrowClockwise className={spinning ? 'spin' : ''} />
    </button>
  );
}

export default RefreshButton;