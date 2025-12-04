// src/api/client.js
import axios from "axios";
import { BASE_URL } from "./api"; // usamos la misma base que en api.js

// Instancia principal para requests autenticadas
const api = axios.create({
  baseURL: BASE_URL,
});

// Agregamos el token JWT automáticamente si existe
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;