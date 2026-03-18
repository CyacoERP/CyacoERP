import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import QuoteForm from "./pages/QuoteForm";
import QuoteThanks from "./pages/QuoteThanks";
import QuoteHistory from "./pages/QuoteHistory";
import QuoteDetail from "./pages/QuoteDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import DashboardSales from "./pages/DashboardSales";
import DashboardClients from "./pages/DashboardClients";
import DashboardProjects from "./pages/DashboardProjects";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/registro",
    Component: Register,
  },
  {
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "catalogo", Component: Catalog },
      { path: "catalogo/:id", Component: ProductDetail },
      { path: "cotizaciones/nueva", Component: QuoteForm },
      { path: "cotizaciones/gracias", Component: QuoteThanks },
      { path: "cotizaciones/historial", Component: QuoteHistory },
      { path: "cotizaciones/:id", Component: QuoteDetail },
      { path: "proyectos", Component: Projects },
      { path: "proyectos/:id", Component: ProjectDetail },
      { path: "dashboards/ventas", Component: DashboardSales },
      { path: "dashboards/clientes", Component: DashboardClients },
      { path: "dashboards/proyectos", Component: DashboardProjects },
      { path: "admin", Component: Admin },
      { path: "blog", Component: Blog },
      { path: "contacto", Component: Contact },
      { path: "perfil", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);
