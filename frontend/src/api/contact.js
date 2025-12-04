// src/api/contact.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function sendContactMessage({ name, email, message }) {
  const res = await fetch(`${API_BASE_URL}/contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Error al enviar el mensaje.");
  }

  return data;
}