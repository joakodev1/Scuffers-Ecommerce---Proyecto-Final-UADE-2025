// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    // 
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center px-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -left-40 -top-40 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute -right-40 bottom-[-120px] h-80 w-80 rounded-full bg-slate-300/40 blur-3xl"
      />

      {/* Card principal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_18px_55px_rgba(15,23,42,0.15)] px-6 sm:px-8 py-7">
          {/* Logo arriba */}
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <img
                src="/smile.png"
                alt="Scuffers Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="text-center leading-tight">
              <p className="text-sm font-semibold text-slate-900">Scuffers</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Streetwear
              </p>
            </div>
          </div>

          {/* Títulos */}
          <div className="text-center mb-5">
            <p className="text-xs font-medium tracking-[0.22em] uppercase text-slate-400">
              Recuperar contraseña
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Ingresá el email con el que te registraste y, cuando el sistema
              esté conectado, te vamos a enviar un enlace para restablecerla.
            </p>
          </div>

          {/* Formulario */}
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vos@scuffers.com"
                  required
                  className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/60 transition"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.98, y: 0 }}
                disabled={loading}
                className="mt-1 w-full rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition-transform"
              >
                {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
              </motion.button>
            </form>
          ) : (
            <div className="mt-4 text-center text-xs text-slate-500 space-y-3">
              <p>
                Si el email corresponde a una cuenta registrada, vas a recibir un
                correo con instrucciones para restablecer tu contraseña.
              </p>
              <p className="font-medium text-slate-700">
                Recordá revisar también la carpeta de spam.
              </p>
            </div>
          )}

          {/* Links inferiores */}
          <div className="mt-6 flex flex-col gap-2 text-[11px] text-slate-400">
            <Link
              to="/login"
              className="text-slate-600 hover:text-sky-600 hover:underline text-center"
            >
              ← Volver a iniciar sesión
            </Link>
            <Link
              to="/"
              className="text-slate-500 hover:text-sky-600 hover:underline text-center"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}