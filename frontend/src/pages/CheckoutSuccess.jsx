// src/pages/CheckoutSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../api/client";

export default function CheckoutSuccess() {
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function notifyBackend() {
      try {

        const query = new URLSearchParams(search || "");
        const paramsObj = Object.fromEntries(query.entries());


        if (!paramsObj || Object.keys(paramsObj).length === 0) {
          setResult({ error: true });
          setLoading(false);
          return;
        }


        const res = await api.get("/checkout/mp/feedback/", {
          params: paramsObj,
        });

        setResult(res.data);
      } catch (err) {
        console.error("Error al confirmar pago con el backend:", err);
        setResult({ error: true });
      } finally {
        setLoading(false);
      }
    }

    notifyBackend();
  }, [search]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center items-start bg-slate-50">
        <p className="text-sm text-slate-600">Confirmando tu pago...</p>
      </div>
    );
  }

  const hasError = result?.error || !result || result?.ok === false;

  return (
    <div className="min-h-screen pt-28 px-4 pb-16 bg-slate-50">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
            Checkout
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Gracias por tu compra 🖤
          </h1>
        </header>

        {hasError ? (
          <div className="bg-white rounded-2xl shadow-ssssm p-5 space-y-2">
            <p className="text-sm text-red-600">
              No pudimos confirmar tu pago automáticamente.
            </p>
            <p className="text-xs text-slate-500">
              Si ves el débito en tu cuenta de Mercado Pago, por favor
              contactanos con el número de operación para que podamos revisar
              tu pedido.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <p className="text-sm text-slate-700">
              Tu pedido{" "}
              <span className="font-semibold">
                #{result.pedido_id}
              </span>{" "}
              quedó en estado:{" "}
              <span className="font-semibold">{result.estado}</span>.
            </p>
            <p className="text-xs text-slate-500">
              Estado reportado por Mercado Pago:{" "}
              <span className="font-mono">
                {result.payment_status || "—"}
              </span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          {!hasError && result?.pedido_id && (
            <Link
              to={`/my-orders/${result.pedido_id}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium"
            >
              Ver detalle del pedido
            </Link>
          )}

          <Link
            to="/my-orders"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-800 bg-white"
          >
            Ir a mis pedidos
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-100 text-sm font-medium text-slate-800"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}