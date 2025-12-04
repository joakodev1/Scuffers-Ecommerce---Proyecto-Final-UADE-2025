// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { getImageUrl } from "../api/products.js";

// 🔐 Detecta si un string "parece" un JWT (tres partes separadas por puntos)
function looksLikeJwt(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && !token.includes(" ");
}

// 🔐 Helper para encontrar el JWT en localStorage
function getJwtToken() {
  // 1) Keys típicas directas
  const directKeys = ["access_token", "accessToken", "token"];
  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (looksLikeJwt(value)) {
      console.log("[checkout] JWT encontrado en key directa:", key);
      return value;
    }
  }

  // 2) Keys típicas con JSON { access, refresh, ... }
  const jsonKeys = [
    "authTokens",
    "auth_tokens",
    "auth",
    "user",
    "scuffers_auth",
  ];
  for (const key of jsonKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const cand = parsed.access || parsed.access_token || parsed.token;
      if (looksLikeJwt(cand)) {
        console.log("[checkout] JWT encontrado en JSON key:", key);
        return cand;
      }
    } catch {
      // ignoramos parseos fallidos
    }
  }

  // 3) Heurística general: revisar TODAS las keys de localStorage
  for (const key of Object.keys(localStorage)) {
    const raw = localStorage.getItem(key);

    if (looksLikeJwt(raw)) {
      console.log("[checkout] JWT encontrado por heurística (string) en key:", key);
      return raw;
    }

    try {
      const parsed = JSON.parse(raw);
      const cand = parsed?.access || parsed?.access_token || parsed?.token;
      if (looksLikeJwt(cand)) {
        console.log(
          "[checkout] JWT encontrado por heurística (JSON) en key:",
          key
        );
        return cand;
      }
    } catch {
      // no era JSON, seguimos
    }
  }

  console.warn("[checkout] No se encontró JWT en localStorage. Keys:", Object.keys(localStorage));
  return "";
}

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // ya no intento accessToken del contexto

  const {
    cart,
    loading,
    updating,
    refreshCart,
    addToCart,
    removeFromCart,
    totalItems,
  } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);

  // Cargar carrito al entrar
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?next=/cart");
      return;
    }
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ✅ ahora el serializer SIEMPRE devuelve "items"
  const items = cart?.items || [];

  // ✅ el serializer usa "total_precio"
  const total = Number(cart?.total_precio ?? 0);

  // Helpers para slug, talle, producto, imagen, etc.
  function getItemSlug(item) {
    return (
      item.producto?.slug ||
      item.product?.slug ||
      item.slug ||
      item.product_slug ||
      ""
    );
  }

  function getItemSize(item) {
    return item.talle || item.size || null;
  }

  function getItemProduct(item) {

    return item.producto || item.product || {};
  }

  function getItemImageSrc(item) {
    const p = getItemProduct(item);


    const raw =
      (Array.isArray(p.images) && p.images[0]) ||
      p.image ||
      p.image_hover ||
      p.imagen ||
      p.image_url ||
      p.foto ||
      "";

    return getImageUrl(raw);
  }

  function getItemName(item) {
    const p = getItemProduct(item);
    return p.nombre || p.name || "Producto";
  }

  function getItemCategory(item) {
    const p = getItemProduct(item);
    return p.categoria || p.category || "";
  }

  function getItemPrice(item) {
    const p = getItemProduct(item);
    return Number(p.precio ?? 0);
  }

  function getItemSubtotal(item) {

    if (item.subtotal != null) {
      return Number(item.subtotal);
    }
    return getItemPrice(item) * Number(item.cantidad ?? 1);
  }


  async function handlePlus(item) {
    const slug = getItemSlug(item);
    if (!slug) return;
    const size = getItemSize(item);
    await addToCart(slug, 1, size);
  }

  async function handleMinus(item) {
    const slug = getItemSlug(item);
    if (!slug) return;
    const size = getItemSize(item);
    await removeFromCart(slug, 1, size);
  }

  async function handleRemove(item) {
    const slug = getItemSlug(item);
    if (!slug) return;
    const size = getItemSize(item);
    const qty = Number(item.cantidad ?? 1);
    await removeFromCart(slug, qty, size);
  }

  async function handleMercadoPagoCheckout() {
    if (
      totalItems === 0 ||
      items.length === 0 ||
      checkingOut ||
      updating
    ) {
      return;
    }

    try {
      setCheckingOut(true);

      const token = getJwtToken();

      if (!token) {
        alert(
          "No se encontró tu sesión de usuario en el navegador. Volvé a iniciar sesión para poder pagar."
        );
        return;
      }

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

      // 1) Crear pedido desde el carrito
      const createRes = await fetch(
        `${API_BASE_URL}/api/checkout/create-order/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        console.error("Error al crear pedido", err);
        alert("No se pudo crear el pedido. Intentá de nuevo.");
        return;
      }

      const pedido = await createRes.json();
      const orderId = pedido.id;

      // 2) Confirmar envío (por ahora datos dummy)
      const shippingPayload = {
        order_id: orderId,
        direccion: "A coordinar",
        ciudad: "Rosario",
        provincia: "Santa Fe",
        codigo_postal: "2000",
        costo_envio: 0,
        observaciones: "",
      };

      const shippingRes = await fetch(
        `${API_BASE_URL}/api/checkout/confirm-shipping/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(shippingPayload),
        }
      );

      if (!shippingRes.ok) {
        const err = await shippingRes.json().catch(() => ({}));
        console.error("Error al confirmar envío", err);
        alert("No se pudo confirmar el envío.");
        return;
      }

      // 3) Crear preferencia de Mercado Pago
      const mpRes = await fetch(
        `${API_BASE_URL}/api/checkout/mercadopago/preference/${orderId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!mpRes.ok) {
  const err = await mpRes.json().catch(() => ({}));
  console.error("Error al crear preferencia MP", err);

  const mpMsg =
    err?.mp_error?.message ||
    err?.detail ||
    "No se pudo iniciar el pago con Mercado Pago.";

  alert(`Error de Mercado Pago: ${mpMsg}`);
  return;
}

      const mpData = await mpRes.json();

      if (!mpData.init_point) {
        console.error("Respuesta de MP inesperada:", mpData);
        alert("No se recibió el link de pago de Mercado Pago.");
        return;
      }

      // 4) Redirigir a Mercado Pago
      window.location.href = mpData.init_point;
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error inesperado al iniciar el pago.");
    } finally {
      setCheckingOut(false);
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 px-4 pb-16">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr,1fr] gap-10">
        {/* COLUMNA IZQUIERDA - LISTA DE ÍTEMS */}
        <section>
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Tu carrito
              </h1>
              <p className="text-sm text-slate-500">
                {totalItems === 0
                  ? "No tenés productos en el carrito."
                  : `Tenés ${totalItems} producto${
                      totalItems !== 1 ? "s" : ""
                    } en tu carrito.`}
              </p>
            </div>

            <Link
              to="/shop"
              className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
            >
              ← Seguir comprando
            </Link>
          </header>

          {loading && (
            <p className="text-sm text-slate-600">Cargando carrito...</p>
          )}

          {!loading && items.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
              Tu carrito está vacío. Empezá agregando tus prendas favoritas.
            </div>
          )}

          <div className="space-y-4">
            {items.map((item, index) => {
              const idKey =
                item.id ||
                `${getItemSlug(item) || "item"}-${
                  getItemSize(item) || "no-size"
                }-${index}`;

              const imgSrc = getItemImageSrc(item);
              const qty = Number(item.cantidad ?? 1);
              const subtotal = getItemSubtotal(item);

              return (
                <motion.article
                  key={idKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 rounded-2xl bg-white border border-slate-200/70 px-4 py-4 shadow-sm"
                >
                  {/* Imagen */}
                  <div className="h-24 w-24 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={getItemName(item)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Sin foto</span>
                    )}
                  </div>

                  {/* Datos del producto */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        {getItemCategory(item)}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {getItemName(item)}
                      </p>
                      {getItemSize(item) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Talle:{" "}
                          <span className="font-semibold">
                            {getItemSize(item)}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Cantidad + Eliminar */}
                    <div className="flex flex-col items-start gap-1 mt-1">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          Cantidad:
                        </span>
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleMinus(item)}
                            disabled={updating}
                            className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="px-3 text-xs font-medium text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePlus(item)}
                            disabled={updating}
                            className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={updating}
                        className="text-[11px] text-slate-400 hover:text-red-500 hover:underline disabled:opacity-50"
                      >
                        Eliminar producto
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex flex-col items-end justify-between text-right">
                    <span className="text-xs text-slate-400">Subtotal</span>
                    <span className="text-sm font-semibold text-slate-900">
                      $
                      {subtotal.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* COLUMNA DERECHA - RESUMEN */}
        <aside className="lg:mt-4">
          <div className="rounded-3xl bg-white border border-slate-200/70 shadow-md p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Resumen de compra
            </h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total productos</dt>
                <dd className="font-medium text-slate-900">{totalItems}</dd>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-semibold text-slate-900">
                  $
                  {total.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </dl>

            <motion.button
              whileHover={{
                scale:
                  updating || checkingOut || totalItems === 0 || items.length === 0
                    ? 1
                    : 1.01,
                y:
                  updating || checkingOut || totalItems === 0 || items.length === 0
                    ? 0
                    : -1,
              }}
              whileTap={{
                scale:
                  updating || checkingOut || totalItems === 0 || items.length === 0
                    ? 1
                    : 0.98,
                y: 0,
              }}
              type="button"
              onClick={handleMercadoPagoCheckout}
              disabled={
                updating || checkingOut || totalItems === 0 || items.length === 0
              }
              className="mt-6 w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_12px_30px_rgba(15,23,42,0.45)]"
            >
              {checkingOut
                ? "Redirigiendo a Mercado Pago..."
                : "Pagar con Mercado Pago"}
            </motion.button>
          </div>
        </aside>
      </div>
    </main>
  );
}