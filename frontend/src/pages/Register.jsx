// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext.jsx";
import registerHero from "../assets/registerhero.webp";
import { BASE_URL } from "../api/api.js";

const API_BASE_URL = BASE_URL; // ya viene con /api

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMsg("Completá tu nombre y email.");
      return;
    }

    if (form.password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.password !== form.confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedEmail,
          email: trimmedEmail,
          password: form.password,
          first_name: trimmedName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.email) {
          throw new Error(
            Array.isArray(data.email) ? data.email[0] : String(data.email)
          );
        } else if (data.username) {
          throw new Error(
            Array.isArray(data.username)
              ? data.username[0]
              : String(data.username)
          );
        } else if (data.password) {
          throw new Error(
            Array.isArray(data.password)
              ? data.password[0]
              : String(data.password)
          );
        } else if (data.detail) {
          throw new Error(String(data.detail));
        } else {
          throw new Error("No se pudo crear la cuenta. Revisá los datos.");
        }
      }

      navigate("/login");
    } catch (err) {
      console.error("Error de registro:", err);
      setErrorMsg(
        err.message ||
          "No se pudo crear la cuenta. Probá nuevamente en unos minutos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 pt-[104px]">
      {/* FONDO CON FOTO */}
      <div className="absolute inset-0 -z-10">
        <img
          src={registerHero}
          alt="Scuffers backstage"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid gap-8 md:grid-cols-[1.15fr,1fr] items-center">
          {/* PANEL IZQUIERDO */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:flex flex-col gap-5 bg-white rounded-3xl border border-slate-200/70 shadow-[0_18px_55px_rgba(15,23,42,0.55)] px-10 py-10"
          >
            <div className="inline-flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <img
                  src="/smile.png"
                  alt="Scuffers Logo"
                  className="h-9 w-9 object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                  Scuffers
                </span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Streetwear
                </span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Unite al club,
              <span className="block text-sky-600">
                creá tu cuenta Scuffers.
              </span>
            </h1>

            <p className="text-sm text-slate-600 max-w-md">
              Guardá tus datos de envío, seguí tus pedidos y recibí antes que
              nadie los próximos drops, restocks y promos.
            </p>

            <p className="text-xs text-slate-500">
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-slate-700 hover:text-sky-600 hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>
          </motion.div>

          {/* PANEL DERECHO (FORM) */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white border border-slate-200/70 rounded-3xl shadow-[0_18px_55px_rgba(15,23,42,0.55)] px-6 sm:px-8 py-7"
          >
            {/* Header móvil con logo */}
            <div className="md:hidden mb-5 flex flex-col items-center gap-2">
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

            {/* Título centrado */}
            <div className="text-center mb-6 md:mb-5">
              <p className="text-xs font-medium tracking-[0.22em] uppercase text-slate-400">
                Crear cuenta
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Empezá a vivir el mood Scuffers
              </h2>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Nombre y apellido
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                  className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/60 transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vos@scuffers.com"
                  required
                  className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/60 transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 caracteres"
                  minLength={8}
                  required
                  className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/60 transition"
                />
              </div>

              {/* Confirmación */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Repetí la contraseña
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repetí la contraseña"
                  minLength={8}
                  required
                  className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/60 transition"
                />
              </div>

              {/* Acepto términos */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <p className="text-[11px] text-slate-500">
                  Acepto los{" "}
                  <button
                    type="button"
                    className="text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    términos y condiciones
                  </button>{" "}
                  y deseo recibir novedades de Scuffers.
                </p>
              </div>

              {/* Error */}
              {errorMsg && (
                <p className="text-xs text-red-500 text-center">{errorMsg}</p>
              )}

              {/* Botón Register */}
              <motion.button
                whileHover={{
                  scale: loading ? 1 : 1.01,
                  y: loading ? 0 : -1,
                }}
                whileTap={{ scale: loading ? 1 : 0.98, y: 0 }}
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition-transform"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </motion.button>
            </form>

            {/* Texto inferior móvil */}
            <p className="mt-4 text-center text-[11px] text-slate-400 md:hidden">
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-slate-700 hover:text-sky-600 hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>

            {/* Footer mini */}
            <div className="mt-6 flex flex-col items-center gap-1 text-[10px] text-slate-400">
              <p>
                © {new Date().getFullYear()} Scuffers — All rights reserved.
              </p>
              <Link
                to="/"
                className="mt-1 text-slate-500 hover:text-sky-600 hover:underline"
              >
                ← Volver a la tienda
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}