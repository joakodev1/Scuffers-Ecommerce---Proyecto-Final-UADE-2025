// src/pages/MyAccount.jsx
import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function MyAccount() {
  const { user, isAuthenticated } = useAuth();

  const displayName =
    user?.first_name || user?.username || user?.email || "Invitado";

  const email = user?.email || "sin-email@scuffers.com";

  return (
    <div className="min-h-screen bg-slate-50 pt-28 px-4 pb-16">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <header>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
            Mi cuenta
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Hola, {displayName}.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Desde acá vas a poder ver tus datos y, más adelante, gestionar tus
            pedidos cuando conectemos el backend real.
          </p>
        </header>

        {/* FILA ÚNICA: PERFIL + CARD OSCURA */}
        <div className="grid gap-4 lg:grid-cols-[2fr,1.2fr]">
          {/* Tarjeta de perfil */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                {(displayName || "I").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Perfil
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500">{email}</p>
              </div>
            </div>

            <div className="flex flex-col justify-center text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Estado: {isAuthenticated ? "Cliente registrado" : "No logueado"}
              </span>
              <span className="mt-1">
                Último inicio: <span className="font-medium">Hoy</span>
              </span>
            </div>
          </section>

          {/* Card oscura "Seguimos" */}
          <section className="bg-slate-900 text-slate-50 rounded-2xl shadow-xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
                Seguimos
              </p>
              <h2 className="text-lg font-semibold">
                Volvé al drop y seguí agregando piezas a tu colección.
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Muy pronto vas a poder ver acá tus pedidos reales, direcciones y
                favoritos vinculados a tu cuenta Scuffers.
              </p>
            </div>

            <div className="mt-4">
              <Link
                to="/shop"
                className="inline-flex items-center rounded-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-1.5 shadow-sm hover:bg-slate-100"
              >
                Ver productos
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}