// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://scuffers-ecommerce-proyecto-final-uade-2025-production.up.railway.app/api",
  // withCredentials: true,  // ❌ sacá esta línea (o ponela en false)
});

export default api;