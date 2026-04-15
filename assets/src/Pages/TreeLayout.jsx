import Navigation from "../Components/Navigation";
import Container from "react-bootstrap/Container";
import { Outlet, useNavigation } from 'react-router-dom';


export const TreeLayout = () => {
  const { state } = useNavigation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Container>
        <Navigation />
      </Container>
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {state === "loading" ? 'Loading...' : <Outlet />}
      </main>
    </div>
  );
};
