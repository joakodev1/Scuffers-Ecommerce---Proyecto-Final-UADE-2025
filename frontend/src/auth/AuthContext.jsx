// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);


  function setAuthToken(token) {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }

  async function fetchMe() {
    const res = await api.get("/auth/me/");


    const mappedUser = {
      ...res.data,
      is_staff: !!res.data.is_staff,
      is_superuser: !!res.data.is_superuser,
    };

    setUser(mappedUser);
    setIsAuthenticated(true);
    return mappedUser;
  }


  async function loginWithEmail(email, password) {
    try {
      const res = await api.post("/auth/login/", {
        username: email,
        password,
      });

      const { access, refresh } = res.data;


      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      setAuthToken(access);


      const me = await fetchMe();
      return me;
    } catch (err) {
      console.error("Error al iniciar sesión:", err.response?.data || err);
      throw err;
    }
  }


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
    setAuthToken(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setIsAuthenticated(false);
  }

 
  const isAdmin = !!(user?.is_staff || user?.is_superuser);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}