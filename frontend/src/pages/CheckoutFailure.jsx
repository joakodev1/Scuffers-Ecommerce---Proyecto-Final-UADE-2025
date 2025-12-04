// src/pages/CheckoutFailure.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CheckoutFailure() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/80 border border-red-500/40 shadow-[0_18px_60px_rgba(0,0,0,0.65)] p-8 space-y-6"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-red-500/60 bg-red-500/10 px-4 py-1 text-xs font-medium tracking-[0.18em] uppercase text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Payment Failed
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            El pago fue rechazado 😕
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            No pudimos procesar tu pago. Puede ser un error del medio de pago o
            un rechazo de la entidad emisora.
          </p>
        </div>

        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <li>Verificá que los datos de tu tarjeta sean correctos.</li>
          <li>Revisá el límite disponible y los fondos.</li>
          <li>Probá con otro medio de pago o más tarde.</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link
            to="/cart"
            className="flex-1 inline-flex items-center justify-center rounded-full bg-slate-50 text-slate-950 text-sm font-semibold py-2.5 hover:bg-white transition"
          >
            Volver al carrito
          </Link>
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-600 text-sm font-medium text-slate-200 py-2.5 hover:bg-slate-800/60 transition"
          >
            Ir al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}