// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext.jsx";
import heroBg from "../assets/hero-scuffers.webp";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const email = form.email.trim();
      if (!email || !form.password) {
        setErrorMsg("Completá email y contraseña.");
        return;
      }

      await loginWithEmail(email, form.password);
      navigate("/");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      const data = err?.response?.data;
      if (data?.detail) setErrorMsg(String(data.detail));
      else if (data?.non_field_errors)
        setErrorMsg(
          Array.isArray(data.non_field_errors)
            ? data.non_field_errors[0]
            : String(data.non_field_errors)
        );
      else setErrorMsg("No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => console.log("login con Google");

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid gap-10 md:grid-cols-[1.2fr,1fr] items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:flex flex-col gap-5 text-slate-900 
                       bg-white/85 backdrop-blur-xl border border-white/60 
                       rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.45)] p-8"
          >
            <div className="inline-flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <img src="/smile.png" alt="logo" className="h-9 w-9" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold">Scuffers</span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Streetwear
                </span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
              Bueno volver a verte,
              <span className="block text-sky-600">
                inicia sesión en tu cuenta.
              </span>
            </h1>

            <p className="text-sm text-slate-600 max-w-md">
              Accedé para seguir tus órdenes, guardar favoritos y enterarte
              primero de los próximos drops de Scuffers.
            </p>

            <p className="text-xs text-slate-500">
              ¿Todavía no tenés cuenta?{" "}
              <Link
                to="/register"
                className="font-medium text-sky-600 hover:underline"
              >
                Crear cuenta
              </Link>
            </p>
          </motion.div>

          {/* CARD LOGIN */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl 
                       shadow-[0_18px_55px_rgba(0,0,0,0.5)] px-6 sm:px-8 py-7"
          >
            {/* Header móvil */}
            <div className="md:hidden mb-5 flex flex-col items-center gap-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <img src="/smile.png" className="h-8 w-8" />
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-6">
              <p className="text-xs font-medium tracking-[0.22em] uppercase text-slate-400">
                Login
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Bienvenido de vuelta
              </h2>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-full 
                         border border-slate-200 bg-slate-50 hover:bg-white py-2.5 text-sm 
                         font-medium text-slate-700 shadow-sm"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 text-[10px] text-sky-500">
                G
              </span>
              <span>Continuar con Google</span>
            </button>

            {/* Separador */}
            <div className="flex items-center my-5 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="px-3">o con tu email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vos@scuffers.com"
                  className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm border 
                             border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/60"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 caracteres"
                    className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm border 
                               border-slate-200 focus:border-sky-500 focus:ring-2 
                               focus:ring-sky-400/60 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500"
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {/* Extras */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-500">
                  <input type="checkbox" className="h-3.5 w-3.5 text-sky-600" />
                  Recordarme
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sky-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 text-center">{errorMsg}</p>
              )}

              {/* Botón */}
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className="mt-2 w-full rounded-full bg-slate-900 hover:bg-slate-800 
                           text-white text-sm font-semibold py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.65)]"
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-6 flex flex-col items-center gap-1 text-[10px] text-slate-400">
              <p>© {new Date().getFullYear()} Scuffers — All rights reserved.</p>
              <Link to="/" className="text-slate-500 hover:underline">
                ← Volver a la tienda
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
