import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { FinanceProvider } from "./context/FinanceContext";
import { Toaster } from "sonner";

function ProtectedLayout() {
  const token = localStorage.getItem("harbor_token");
  if (!token) return <Navigate to="/login" replace />;
  return <Layout />;
}

const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "transactions", Component: Transactions },
      { path: "budget", Component: Budget },
      { path: "goals", Component: Goals },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
    ],
  },
]);

export default function App() {
  return (
    <FinanceProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          },
        }}
      />
    </FinanceProvider>
  );
}