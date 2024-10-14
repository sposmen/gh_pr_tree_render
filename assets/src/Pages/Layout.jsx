import Navigation from "components/Helpers/Navigation";
import Container from "react-bootstrap/Container";
import { Outlet } from 'react-router-dom';


export const Layout = () => {
  return (
    <Container>
      <Navigation />
      <main style={{ padding: '1rem 0' }}>
        <Outlet />
      </main>
    </Container>
  );
};
