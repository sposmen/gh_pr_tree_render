import Navigation from "../Components/Navigation";
import Container from "react-bootstrap/Container";
import { Outlet, useNavigation } from 'react-router-dom';

export const TreeLayout = () => {
  const { state } = useNavigation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <header className="bg-body-tertiary" style={{ flexShrink: 0 }}>
        <Container><Navigation /></Container>
      </header>
      <main style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        {state === "loading" ? 'Loading...' : <Outlet />}
      </main>
    </div>
  );
};
