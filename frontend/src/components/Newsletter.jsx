// src/components/Newsletter.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { BASE_URL } from "../api/api.js";

const API_BASE_URL = BASE_URL;

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Error al suscribirte.");
      }

      setMsg("✓ Te suscribiste correctamente 🚀");
      setEmail("");
    } catch (err) {
      setMsg("⚠️ " + (err.message || "Hubo un problema al suscribirte."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full py-16 flex flex-col items-center bg-white">
      <h2 className="text-2xl font-semibold text-center">
        Suscribite a los drops de Scuffers
      </h2>

      <p className="text-gray-600 mt-2 text-center max-w-md">
        Enterate primero de nuevos lanzamientos, restocks y promos exclusivas.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex gap-3 w-full max-w-xl px-4"
      >
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 shadow-sm"
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="bg-[#0a1029] text-white px-6 py-3 rounded-lg shadow-md"
        >
          {loading ? "Enviando..." : "Suscribirme"}
        </motion.button>
      </form>

      {msg && (
        <p className="mt-4 text-center text-sm text-gray-700">
          {msg}
        </p>
      )}
    </div>
  );
}