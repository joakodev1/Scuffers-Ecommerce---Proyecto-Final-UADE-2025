// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  // withCredentials: true,  // ❌ sacá esta línea (o ponela en false)
});

export default api;