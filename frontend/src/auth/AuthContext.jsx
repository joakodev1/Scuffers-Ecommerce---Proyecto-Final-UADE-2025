// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // helper para setear / limpiar el header Authorization
  function setAuthToken(token) {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }

  async function fetchMe() {
    const res = await api.get("/auth/me/");
    setUser(res.data);
    setIsAuthenticated(true);
    return res.data;
  }

  // LOGIN POR EMAIL (usamos el email como username para el backend)
  async function loginWithEmail(email, password) {
    try {
      const res = await api.post("/auth/login/", {
        username: email, // 👈 la mayoría de backends DRF esperan "username"
        password,
      });

      const { access, refresh } = res.data;

      // guardar tokens
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      setAuthToken(access);

      // obtener datos del usuario logueado
      const me = await fetchMe();
      return me;
    } catch (err) {
      console.error("Error al iniciar sesión:", err.response?.data || err);
      throw err;
    }
  }

  // intentar recuperar sesión al montar la app
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    fetchMe()
      .catch((err) => {
        console.error("Error recuperando sesión:", err.response?.data || err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, loginWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}