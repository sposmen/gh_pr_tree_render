import axios from "axios";
import { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { Trash } from "react-bootstrap-icons";
import { RepoLink } from "./RepoLink";

export async function ownersLoader() {
  const { data } = await axios.get('/api/v1/tree');
  return data;
}

function OwnerItem({ login, avatarUrl, onDelete }) {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center">
      <RepoLink owner={login}>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt=""
            width={24}
            height={24}
            style={{ borderRadius: '50%', marginRight: 8 }}
          />
        )}
        {login}
      </RepoLink>
      {onDelete && (
        <Button variant="outline-danger" size="sm" onClick={onDelete} title="Remove">
          <Trash />
        </Button>
      )}
    </ListGroup.Item>
  );
}

function SavedOwners({ savedOwners }) {
  const revalidator = useRevalidator();
  const [login, setLogin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    const trimmed = login.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      await axios.post('/api/v1/owner', { login: trimmed });
      setLogin('');
      revalidator.revalidate();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    setError(null);
    try {
      await axios.delete(`/api/v1/owner/${id}`);
      revalidator.revalidate();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h4>Saved owners</h4>
      <Form onSubmit={add} className="mb-2">
        <InputGroup>
          <Form.Control
            placeholder="owner login (user or org)"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            disabled={busy}
          />
          <Button type="submit" disabled={busy || !login.trim()}>Add</Button>
        </InputGroup>
      </Form>
      {error && <div className="text-danger small mb-2">{error}</div>}
      <ListGroup>
        {savedOwners.length === 0 && (
          <ListGroup.Item className="text-muted">No saved owners.</ListGroup.Item>
        )}
        {savedOwners.map((o) => (
          <OwnerItem key={o.id} login={o.login} onDelete={() => remove(o.id)} />
        ))}
      </ListGroup>
    </>
  );
}

export default function OwnersList() {
  const { viewer, organizations, savedOwners = [], error } = useLoaderData();

  return (
    <Container className="py-3" style={{ overflow: 'auto', height: '100%' }}>
      {error && <div className="text-warning mb-3">{error}</div>}
      <Row>
        <Col md={6}>
          <h4>User</h4>
          <ListGroup className="mb-4">
            {viewer
              ? <OwnerItem login={viewer.login} avatarUrl={viewer.avatarUrl} />
              : <ListGroup.Item className="text-muted">—</ListGroup.Item>}
          </ListGroup>

          <h4>Organizations</h4>
          <ListGroup>
            {organizations.length === 0 && (
              <ListGroup.Item className="text-muted">No organizations.</ListGroup.Item>
            )}
            {organizations.map((org) => (
              <OwnerItem key={org.login} login={org.login} avatarUrl={org.avatarUrl} />
            ))}
          </ListGroup>
        </Col>
        <Col md={6}>
          <SavedOwners savedOwners={savedOwners} />
        </Col>
      </Row>
    </Container>
  );
}