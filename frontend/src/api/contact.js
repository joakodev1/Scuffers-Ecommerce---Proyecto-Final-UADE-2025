// src/api/contact.js
import { BASE_URL } from "./api.js";

// BASE_URL ya tiene el /api al final, ej:
// https://scuffers-ecommerce-proyecto-final-uade-2025-production.up.railway.app/api
const API_BASE_URL = BASE_URL;

export async function sendContactMessage({ name, email, subject, message }) {
  const payload = {
    // 👇 nombres que espera tu backend Django
    nombre: name,
    email: email,
    asunto: subject,
    mensaje: message,
  };

  const res = await fetch(`${API_BASE_URL}/contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Intentamos parsear JSON, pero si no hay, no rompemos
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Error al enviar el mensaje.");
  }

  return data;
}