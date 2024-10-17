import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Layout } from "./Layout";
import ErrorPage from "./Error";
import Home from "./Home";

import { treeRoutes } from "./Tree/Tree";
import { configRoutes } from "./Config";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      ...configRoutes,
      ...treeRoutes
    ],
  },

]);

const App = () => {
  return <RouterProvider router={router} />;
};

const root = createRoot(document.getElementById('root'));

root.render(<App />);
