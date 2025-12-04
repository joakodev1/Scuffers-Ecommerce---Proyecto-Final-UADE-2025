// src/pages/MyOrders.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BASE_URL } from "../api/api.js";

const API_BASE_URL = BASE_URL.replace(/\/api\/?$/, "");

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  cancelled: "bg-rose-100 text-rose-800 border border-rose-200",
  shipped: "bg-sky-100 text-sky-800 border border-sky-200",
};

const statusLabels = {
  paid: "Pagado",
  pending: "Pendiente",
  cancelled: "Cancelado",
  shipped: "Enviado",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("access");

        const res = await fetch(
          `${API_BASE_URL}/api/orders/my/?status=paid`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login?next=/my-orders");
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Error al cargar tus pedidos.");
        }

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Error al cargar tus pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Mis pedidos
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acá vas a ver el historial de tus pedidos y la{" "}
              <span className="font-medium">dirección de envío</span> usada en
              cada uno.
            </p>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            Ver catálogo
          </button>
        </div>

        {/* estado de carga / error / vacío */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-200/70 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-xl">
                🧾
              </span>
            </div>
            <p className="text-lg font-medium text-slate-800">
              Todavía no tenés pedidos registrados
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Cuando completes una compra, tu pedido va a aparecer acá.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-black transition"
            >
              Ir a comprar
            </button>
          </div>
        )}

        {/* lista de pedidos */}
        {!loading && !error && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* header desktop */}
            <div className="hidden md:grid grid-cols-12 px-6 py-3 text-xs font-medium text-slate-500 border-b border-slate-100">
              <div className="col-span-2">ID</div>
              <div className="col-span-3">Fecha</div>
              <div className="col-span-3">Estado</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            <ul className="divide-y divide-slate-100">
              {orders.map((order) => {
                const statusClass =
                  statusStyles[order.estado] || statusStyles.pending;
                const label =
                  statusLabels[order.estado] || order.estado?.toUpperCase();

                const fecha = order.creado
                  ? new Date(order.creado).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <li key={order.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 sm:px-6 py-4 flex flex-col gap-3"
                    >
                      {/* fila principal */}
                      <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 md:gap-4">
                        {/* ID */}
                        <div className="md:col-span-2 text-sm font-semibold text-slate-900">
                          #{order.id}
                          <span className="md:hidden ml-2 text-xs text-slate-500">
                            · $
                            {Number(order.total_final || 0).toLocaleString(
                              "es-AR"
                            )}
                          </span>
                        </div>

                        {/* fecha */}
                        <div className="md:col-span-3 text-xs sm:text-sm text-slate-500">
                          {fecha}
                        </div>

                        {/* estado */}
                        <div className="md:col-span-3">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                              statusClass
                            }
                          >
                            {label}
                          </span>
                        </div>

                        {/* total */}
                        <div className="md:col-span-2 text-sm font-semibold text-slate-900 md:text-right">
                          $
                          {Number(order.total_final || 0).toLocaleString(
                            "es-AR"
                          )}
                        </div>

                        {/* acciones */}
                        <div className="md:col-span-2 flex md:justify-end">
                          <Link
                            to={`/my-orders/${order.id}`}
                            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </div>

                      {/* dirección de envío + contacto */}
                      <div className="grid gap-3 md:grid-cols-2 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            Dirección de envío
                          </p>
                          <p className="text-xs sm:text-sm text-slate-800 mt-1 whitespace-pre-line">
                            {order.direccion || "Sin dirección especificada"}
                            {order.ciudad && `\n${order.ciudad}`}
                            {order.provincia && `, ${order.provincia}`}
                            {order.codigo_postal &&
                              `\nCP ${order.codigo_postal}`}
                          </p>
                          {order.observaciones && (
                            <p className="mt-1 text-[11px] text-slate-500">
                              Obs: {order.observaciones}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            Datos de contacto
                          </p>
                          <p className="text-xs sm:text-sm text-slate-800 mt-1">
                            {order.nombre || "Sin nombre"}
                          </p>
                          {order.telefono && (
                            <p className="text-xs sm:text-sm text-slate-600">
                              {order.telefono}
                            </p>
                          )}
                          {order.email && (
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                              {order.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}