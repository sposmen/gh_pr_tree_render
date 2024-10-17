import Navigation from "../Components/Navigation";
import Container from "react-bootstrap/Container";
import { Outlet, useNavigation } from 'react-router-dom';


export const Layout = () => {
  const { state } = useNavigation();
  const renderBody= ()=>{
    if (state === "loading") {
      return 'Loading...';
    }
    return <Outlet />;
  }

  return (
    <Container>
      <Navigation />
      <main style={{ padding: '1rem 0' }}>
        {renderBody()}
      </main>
    </Container>
  );
};
