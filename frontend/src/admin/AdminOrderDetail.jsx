import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchOrder() {
    try {
      const res = await api.get(`/admin/orders/${orderId}/`);
      setOrder(res.data);
    } catch (err) {
      console.error("Error cargando pedido:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="animate-spin" size={18} />
        Cargando pedido...
      </div>
    );
  }

  if (!order) {
    return <p className="text-sm text-red-600">No se pudo cargar el pedido.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={14} />
            Volver a pedidos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-800">
            Pedido #{order.id}
          </h1>
          <p className="text-sm text-slate-500">
            Creado el{" "}
            {order.creado
              ? new Date(order.creado).toLocaleString("es-AR")
              : "—"}
          </p>
        </div>

        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.estado === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : order.estado === "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {order.estado_label}
          </span>
        </div>
      </div>

      {/* Columnas: info cliente + pago/envío */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cliente */}
        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Datos del cliente
          </h2>
          <div className="text-sm text-slate-600 space-y-1">
            <p>
              <span className="font-medium">Nombre: </span>
              {order.nombre || "—"}
            </p>
            <p>
              <span className="font-medium">Email: </span>
              {order.email || "—"}
            </p>
            <p>
              <span className="font-medium">Teléfono: </span>
              {order.telefono || "—"}
            </p>
          </div>
        </section>

        {/* Envío + MP */}
        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Envío y pago
          </h2>
          <div className="text-sm text-slate-600 space-y-1">
            <p>
              <span className="font-medium">Dirección: </span>
              {order.direccion || "—"}
            </p>
            <p>
              <span className="font-medium">Ciudad / Provincia: </span>
              {order.ciudad || "—"}{" "}
              {order.provincia ? `(${order.provincia})` : ""}
            </p>
            <p>
              <span className="font-medium">Código postal: </span>
              {order.codigo_postal || "—"}
            </p>
            <p>
              <span className="font-medium">Observaciones: </span>
              {order.observaciones || "—"}
            </p>
            <hr className="my-2" />
            <p>
              <span className="font-medium">MP status: </span>
              {order.mp_status || "—"}
            </p>
            <p>
              <span className="font-medium">MP payment id: </span>
              {order.mp_payment_id || "—"}
            </p>
          </div>
        </section>
      </div>

      {/* Items y totales */}
      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          Ítems del pedido
        </h2>

        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-slate-600">
                Producto
              </th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">
                Talle
              </th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">
                Cantidad
              </th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">
                Precio
              </th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{item.nombre_producto}</td>
                <td className="px-3 py-2">{item.talle || "—"}</td>
                <td className="px-3 py-2 text-right">{item.cantidad}</td>
                <td className="px-3 py-2 text-right">
                  ${Number(item.precio_unitario).toLocaleString("es-AR")}
                </td>
                <td className="px-3 py-2 text-right">
                  ${Number(item.subtotal).toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex flex-col items-end text-sm text-slate-700 space-y-1">
          <p>
            Subtotal productos:{" "}
            <span className="font-semibold">
              ${Number(order.total_productos).toLocaleString("es-AR")}
            </span>
          </p>
          <p>
            Envío:{" "}
            <span className="font-semibold">
              ${Number(order.costo_envio).toLocaleString("es-AR")}
            </span>
          </p>
          <p className="text-base">
            Total final:{" "}
            <span className="font-semibold">
              ${Number(order.total_final).toLocaleString("es-AR")}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}