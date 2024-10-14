import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Layout } from "components/Pages/Layout";
import ErrorPage from "components/Pages/Error";
import Home from "components/Pages/Home";

import { configRoutes } from "./Config";
import { treeRoutes } from "./Tree/Tree";

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
