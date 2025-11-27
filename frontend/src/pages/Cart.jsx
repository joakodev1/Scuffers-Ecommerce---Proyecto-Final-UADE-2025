// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../auth/AuthContext.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { getImageUrl } from "../api/products.js";

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    cart,
    loading,
    updating,
    refreshCart,
    addToCart,
    removeFromCart,
    totalItems,
  } = useCart();

  const [showSuccess, setShowSuccess] = useState(false);
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
    // con el nuevo serializer viene en "producto"
    return item.producto || item.product || {};
  }

  function getItemImageSrc(item) {
    const p = getItemProduct(item);

    // Primero probamos con la galería (images), después con image
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
    // ✅ usamos el subtotal que manda el backend
    if (item.subtotal != null) {
      return Number(item.subtotal);
    }
    return getItemPrice(item) * Number(item.cantidad ?? 1);
  }

  // Acciones de botones +, -, Eliminar
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

  // 🔐 lógica de "pagar" (checkout falso con popup)
  async function handleCheckout() {
    // Por las dudas, chequeamos de nuevo
    if (totalItems === 0 || items.length === 0 || checkingOut || updating) {
      return;
    }

    try {
      setCheckingOut(true);

      // Simulamos la compra vaciando el carrito
      for (const item of items) {
        const slug = getItemSlug(item);
        if (!slug) continue;
        const size = getItemSize(item);
        const qty = Number(item.cantidad ?? 1);
        await removeFromCart(slug, qty, size);
      }

      // Mostramos el popup de éxito
      setShowSuccess(true);
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
              // ✅ ahora cada item tiene id; usamos eso como key
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

                    {/* Cantidad + Eliminar (reordenado) */}
                    <div className="flex flex-col items-start gap-1 mt-1">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-xs text-slate-500">Cantidad:</span>
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
                scale: updating || checkingOut ? 1 : 1.01,
                y: updating || checkingOut ? 0 : -1,
              }}
              whileTap={{
                scale: updating || checkingOut ? 1 : 0.98,
                y: 0,
              }}
              type="button"
              onClick={handleCheckout}
              disabled={
                updating || checkingOut || totalItems === 0 || items.length === 0
              }
              className="mt-6 w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_12px_30px_rgba(15,23,42,0.45)]"
            >
              {checkingOut ? "Procesando compra..." : "Ir a pagar (placeholder)"}
            </motion.button>
          </div>
        </aside>
      </div>

      {/* POPUP de compra exitosa */}
      {showSuccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setShowSuccess(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative z-50 max-w-sm w-full mx-4 rounded-3xl bg-white p-6 shadow-2xl text-center"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              ¡Gracias por tu compra!
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Tu pedido fue registrado correctamente. Pronto te estaremos
              contactando para coordinar el pago y el envío.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                navigate("/shop");
              }}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Seguir comprando
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}