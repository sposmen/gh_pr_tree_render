import axios from "axios";
import { useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { RepoLink } from "./RepoLink";

export async function ownerReposLoader({ params: { owner } }) {
  const { data } = await axios.get(`/api/v1/tree/${owner}`);
  return data;
}

export default function OwnerRepos() {
  const initial = useLoaderData();
  const { owner } = useParams();
  const [repositories, setRepositories] = useState(initial.repositories || []);
  const [pageInfo, setPageInfo] = useState(initial.pageInfo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initial.error);

  const loadMore = async () => {
    if (!pageInfo?.hasNextPage) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/tree/${owner}`, {
        params: { after: pageInfo.endCursor }
      });
      if (data.error) {
        setError(data.error);
      } else {
        setRepositories((prev) => [...prev, ...data.repositories]);
        setPageInfo(data.pageInfo);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <Container className="py-3">{error}</Container>;

  return (
    <Container className="py-3" style={{ overflow: 'auto', height: '100%' }}>
      <h4>{owner} / repositories</h4>
      <ListGroup>
        {repositories.length === 0 && (
          <ListGroup.Item className="text-muted">No repositories.</ListGroup.Item>
        )}
        {repositories.map((r) => (
          <ListGroup.Item key={r.name}>
            <RepoLink owner={owner} repo={r.name} />
            {r.isPrivate && <span className="text-muted"> (private)</span>}
            {r.description && <div className="text-muted small">{r.description}</div>}
          </ListGroup.Item>
        ))}
      </ListGroup>
      {pageInfo?.hasNextPage && (
        <div className="py-3 text-center">
          <Button variant="outline-primary" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </Container>
  );
}