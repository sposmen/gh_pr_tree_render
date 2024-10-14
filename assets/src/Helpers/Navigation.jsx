import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";
import NavDropdown from "react-bootstrap/NavDropdown";

const Navigation = ()=>{
  return <Navbar bg="light" expand="lg">
    <Container>
      <Navbar.Brand href="#home">GH Pull Request Tree</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/config">Config</Nav.Link>
          <Nav.Link as={Link} to="/tree">Tree</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
}

export default Navigation;
