// src/auth/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();


  if (loading) {
    return null;
  }


  if (!isAuthenticated || !user) {
    console.log("🔒 AdminRoute: usuario no autenticado");
    return <Navigate to="/login" replace />;
  }


  if (!isAdmin) {
    console.log("⚠️ AdminRoute: usuario no es admin", user);
    return <Navigate to="/" replace />;
  }


  console.log("✅ AdminRoute: usuario admin, acceso permitido", user);
  return children;
}