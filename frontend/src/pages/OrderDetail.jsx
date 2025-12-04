// src/pages/OrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BASE_URL } from "../api/api.js";

const API_BASE_URL = BASE_URL.replace(/\/api\/?$/, "");

const statusLabels = {
  paid: "Pagado",
  pending: "Pendiente",
  cancelled: "Cancelado",
  shipped: "Enviado",
};

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  cancelled: "bg-rose-100 text-rose-800 border border-rose-200",
  shipped: "bg-sky-100 text-sky-800 border border-sky-200",
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("ID de pedido inválido.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("access");

        const res = await fetch(
          `${API_BASE_URL}/api/orders/${orderId}/`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            navigate(`/login?next=/my-orders/${orderId}`);
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Error al cargar el pedido.");
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message || "Error desconocido.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Cargando pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
        <p className="text-lg text-rose-600 font-medium mb-2">
          {error || "Error al cargar el pedido."}
        </p>
        <Link
          to="/my-orders"
          className="text-sm text-slate-700 underline hover:text-black"
        >
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const estadoLabel = statusLabels[order.estado] || order.estado.toUpperCase();
  const estadoStyle = statusStyles[order.estado] || statusStyles.pending;
  const items = order.items || [];

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
    <div className="min-h-screen bg-slate-50 pb-16 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Pedido #{order.id}
            </h1>
            {fecha && (
              <p className="text-sm text-slate-500 mt-1">
                Realizado el {fecha}
              </p>
            )}
          </div>

          <Link
            to="/my-orders"
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            ← Volver a mis pedidos
          </Link>
        </div>

        {/* Estado */}
        <div>
          <span
            className={
              "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium " +
              estadoStyle
            }
          >
            {estadoLabel}
          </span>
          {order.mp_status && (
            <span className="ml-3 text-xs text-slate-500">
              Estado MP: {order.mp_status}
            </span>
          )}
        </div>

        {/* Grid principal */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Resumen de totales */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Resumen del pedido
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal productos</span>
                <span>
                  $
                  {Number(order.total_productos || 0).toLocaleString("es-AR")}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Costo de envío</span>
                <span>
                  ${Number(order.costo_envio || 0).toLocaleString("es-AR")}
                </span>
              </div>

              <div className="flex justify-between text-lg font-semibold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>
                  ${Number(order.total_final || 0).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>

          {/* Dirección + contacto */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Envío y contacto
            </h2>

            <div className="text-sm text-slate-700 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Dirección de envío
                </p>
                <p className="mt-1">
                  {order.direccion}, {order.ciudad}, {order.provincia} (CP:{" "}
                  {order.codigo_postal})
                </p>
                {order.observaciones && (
                  <p className="mt-1 text-xs text-slate-500">
                    Observaciones: {order.observaciones}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Datos de contacto
                </p>
                <p className="mt-1">{order.nombre}</p>
                {order.telefono && (
                  <p className="text-slate-600">{order.telefono}</p>
                )}
                {order.email && (
                  <p className="text-slate-600 text-xs mt-0.5">
                    {order.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="px-6 py-4 text-lg font-semibold text-slate-900 border-b border-slate-100">
            Productos del pedido
          </h2>

          {items.length === 0 ? (
            <p className="px-6 py-4 text-sm text-slate-500">
              Este pedido no tiene ítems registrados.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 py-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.nombre_producto}
                    </p>
                    <p className="text-xs text-slate-500">
                      Cantidad: {item.cantidad}
                      {item.talle ? ` — Talle ${item.talle}` : ""}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    ${Number(item.subtotal || 0).toLocaleString("es-AR")}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}