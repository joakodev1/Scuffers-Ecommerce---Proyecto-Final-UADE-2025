// src/api/auth.js
import api from "./api.js"; // tu instancia vieja con baseURL http://127.0.0.1:8000/api

export async function loginWithEmail(email, password) {
  const res = await api.post("/auth/login/", {
    username: email,   // SimpleJWT espera "username"
    password,
  });
  return res.data;
}

export async function registerWithEmail(name, email, password) {
  const res = await api.post("/auth/register/", {
    username: email,
    email,
    password,
    first_name: name,
  });
  return res.data;
}

export function logoutUser() {
  // por ahora solo limpiamos storage del lado del front
  return Promise.resolve();
}