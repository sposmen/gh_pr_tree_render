import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { BoxArrowInUpRight } from 'react-bootstrap-icons';

const steps = [
  {
    number: '1',
    title: 'Set up your GitHub token',
    body: (
      <>
        Go to <Link to="/config">Config</Link> and set yourGitHub personal access token with{' '}
        <code>repo</code> scope and in <code>admin:org</code> section, the <code>read:org</code> scope.
        The token is stored locally and used to query the GitHub GraphQL API.
      </>
    ),
  },
  {
    number: '2',
    title: 'Navigate to a repository tree',
    body: (
      <>
        Visit <code>/tree</code> to browse your organizations and repositories, or go directly to{' '}
        <code>/tree/:owner/:repo</code> (e.g. <code>/tree/facebook/react</code>) to jump straight to the PR tree.
      </>
    ),
  },
  {
    number: '3',
    title: 'Explore the dependency graph',
    body: (
      <>
        Each node is a branch. Edges point from a PR&apos;s head branch to its base branch, showing
        the merge chain. Click a node to filter the tree to that branch&apos;s ancestors and
        descendants.
      </>
    ),
  },
];

const statuses = [
  { label: 'Mergeable', color: 'success' },
  { label: 'Conflicting', color: 'danger' },
  { label: 'Unknown', color: 'warning' },
];

const Home = () => (
  <>
    <Row className="mb-4 mt-2">
      <Col>
        <h1 className="mb-1">GH Pull Request Tree</h1>
        <p className="text-muted lead">
          Visualize open pull requests in any GitHub repository as an interactive dependency graph.
        </p>
        <Button as={Link} to="/tree" variant="primary" className="me-2">
          Browse repositories
        </Button>
        <Button as={Link} to="/config" variant="outline-secondary">
          Configure token
        </Button>
      </Col>
    </Row>

    <Row className="mb-4">
      <Col>
        <h5 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
          Getting started
        </h5>
        <Row xs={1} md={3} className="g-3">
          {steps.map(({ number, title, body }) => (
            <Col key={number}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 32, height: 32, fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    {number}
                  </div>
                  <Card.Title as="h6">{title}</Card.Title>
                  <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {body}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>
    </Row>

    <Row className="mb-4">
      <Col md={6}>
        <Card className="border-0 bg-light h-100">
          <Card.Body>
            <Card.Title as="h6">Node color legend</Card.Title>
            <div className="d-flex gap-2 mt-2">
              {statuses.map(({ label, color }) => (
                <Badge key={label} bg={color} className="fs-6 fw-normal px-3 py-2">
                  {label}
                </Badge>
              ))}
            </div>
            <Card.Text className="text-muted mt-3" style={{ fontSize: '0.9rem' }}>
              Colors reflect each PR&apos;s current mergeability status as reported by GitHub.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} className="mt-3 mt-md-0">
        <Card className="border-0 bg-light h-100">
          <Card.Body>
            <Card.Title as="h6">Tips</Card.Title>
            <ul className="text-muted ps-3 mb-0" style={{ fontSize: '0.9rem' }}>
              <li>Use the <strong>download</strong> button to export the tree as an SVG.</li>
              <li>Use <strong>refresh</strong> to bypass the 30-minute cache and fetch the latest PRs.</li>
              <li>
                Generate a token at{' '}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">
                  github.com/settings/tokens <BoxArrowInUpRight size={11} />
                </a>.
              </li>
            </ul>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </>
);

export default Home;
