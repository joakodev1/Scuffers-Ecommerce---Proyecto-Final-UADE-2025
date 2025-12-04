import { useEffect, useState } from "react";
import { Link } from "react-router-dom";   // 👈 AGREGAR ESTO
import api from "../api/client";
import { Loader2, Eye } from "lucide-react";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      const res = await api.get("/admin/orders/");
      setOrders(res.data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="animate-spin" size={18} />
        Cargando pedidos...
      </div>
    );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Pedidos</h1>
        <p className="text-sm text-slate-500">
          Listado total de pedidos realizados en Scuffers.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-slate-600">
                ID
              </th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">
                Cliente
              </th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">
                Estado
              </th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">
                Total
              </th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">
                Fecha
              </th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100">
                <td className="px-4 py-2">#{order.id}</td>

                <td className="px-4 py-2">
                  <div className="font-medium text-slate-800">
                    {order.nombre || "Sin nombre"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {order.email || "Sin email"}
                  </div>
                </td>

                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.estado === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.estado === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {order.estado_label}
                  </span>
                </td>

                <td className="px-4 py-2">
                  ${Number(order.total_final).toLocaleString("es-AR")}
                </td>

                <td className="px-4 py-2">
                  {order.creado
                    ? new Date(order.creado).toLocaleString("es-AR")
                    : "—"}
                </td>

                <td className="px-4 py-2 text-right">
                  <Link
                    to={`/dashboard/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 text-xs font-medium"
                  >
                    <Eye size={14} />
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-center py-6 text-slate-500">
            No hay pedidos todavía.
          </p>
        )}
      </div>
    </div>
  );
}