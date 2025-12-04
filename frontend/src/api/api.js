// src/api/api.js
import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://scuffers-ecommerce-proyecto-final-uade-2025-production.up.railway.app/api";

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;