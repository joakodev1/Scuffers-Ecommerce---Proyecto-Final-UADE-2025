// src/api/api.js
import axios from "axios";

  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;