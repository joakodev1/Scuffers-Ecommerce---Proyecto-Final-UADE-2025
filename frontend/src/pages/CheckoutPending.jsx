// src/pages/CheckoutPending.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CheckoutPending() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/80 border border-amber-500/50 shadow-[0_18px_60px_rgba(0,0,0,0.65)] p-8 space-y-6"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-amber-400/60 bg-amber-500/10 px-4 py-1 text-xs font-medium tracking-[0.18em] uppercase text-amber-200">
          <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
          Payment Pending
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Tu pago está pendiente ⏳
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Mercado Pago todavía no confirmó el resultado del pago. Cuando se
            acredite o se rechace, vas a recibir una notificación.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
          Podés revisar el estado desde{" "}
          <span className="font-medium text-slate-100">
            tu mail o tu cuenta de Mercado Pago
          </span>
          . Si el pago no se acredita en unos minutos, probá nuevamente.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center rounded-full bg-slate-50 text-slate-950 text-sm font-semibold py-2.5 hover:bg-white transition"
          >
            Volver al inicio
          </Link>
          <Link
            to="/mi-cuenta"
            className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-600 text-sm font-medium text-slate-200 py-2.5 hover:bg-slate-800/60 transition"
          >
            Ver mis pedidos
          </Link>
        </div>
      </motion.div>
    </div>
  );
}