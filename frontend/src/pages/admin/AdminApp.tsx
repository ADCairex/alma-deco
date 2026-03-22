import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import ProductsAdmin from "./ProductsAdmin";

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "true"
  );

  function handleLogin() {
    setAuthenticated(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={handleLogout} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductsAdmin />} />
      </Route>
    </Routes>
  );
}
