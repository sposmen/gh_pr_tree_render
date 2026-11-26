import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";
import { useTheme } from '../Theme';

const Navigation = ()=>{
  const { mode, setMode } = useTheme();
  return <Navbar className="bg-body-tertiary" expand="lg">
    <Container>
      <Navbar.Brand href="#home">GH Pull Request Tree</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/tree">Tree</Nav.Link>
          <Nav.Link as={Link} to="/config">Config</Nav.Link>
        </Nav>
        <select className="form-select form-select-sm w-auto" aria-label="Color theme"
          value={mode} onChange={event => setMode(event.target.value)}>
          <option value="system">System theme</option>
          <option value="light">Light theme</option>
          <option value="dark">Dark theme</option>
        </select>
      </Navbar.Collapse>
    </Container>
  </Navbar>
}

export default Navigation;
