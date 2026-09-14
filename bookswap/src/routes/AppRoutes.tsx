import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import ListingView from "../pages/ListingView";
import ListingCreate from "../pages/ListingCreate";
import ListingEdit from "../pages/ListingEdit";
import MyListings from "../pages/MyListings";
import Favorites from "../pages/Favorites";
import Perfil from "../pages/Perfil";
import Sobre from "../pages/Sobre";
import ComoFunciona from "../pages/ComoFunciona";
import Termos from "../pages/Termos";
import Privacidade from "../pages/Privacidade";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import RequireAuth from "./RequireAuth";
import RequireOwner from "./RequireOwner";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/anuncios/:id", element: <ListingView /> },
          { path: "/anuncios/novo", element: <ListingCreate /> },
          { path: "/meus-anuncios", element: <MyListings /> },
          { path: "/favoritos", element: <Favorites /> },
          { path: "/perfil", element: <Perfil /> },
          { path: "/sobre", element: <Sobre /> },
          { path: "/como-funciona", element: <ComoFunciona /> },
          { path: "/termos", element: <Termos /> },
          { path: "/privacidade", element: <Privacidade /> },

          {
            element: <RequireOwner />,
            children: [
              { path: "/anuncios/:id/editar", element: <ListingEdit /> },
            ],
          },

          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
