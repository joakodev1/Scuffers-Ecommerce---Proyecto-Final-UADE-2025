// src/components/AddToCartPopup.jsx
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../cart/CartContext.jsx";
import { getImageUrl } from "../api/products.js";

export default function AddToCartPopup() {
  const navigate = useNavigate();
  const {
    showAddedPopup,
    lastAdded,
    closeAddedPopup,
    totalItems,
    totalAmount,
  } = useCart();

  if (!showAddedPopup || !lastAdded || !lastAdded.item) return null;

  const { item } = lastAdded;

  const product = item.producto || item.product || item.product_data || item;

  const name = product?.nombre || product?.name || "Producto";
  const price = product?.precio ?? product?.price ?? 0;
  const qty = item?.cantidad ?? item?.quantity ?? 1;

  let imagePath = null;

  if (Array.isArray(product?.images) && product.images.length > 0) {
    imagePath = product.images[0];
  } else {
    imagePath =
      product?.image ||
      product?.imagen ||
      product?.image_url ||
      product?.image_hover ||
      null;
  }

  let imageUrl = null;
  if (typeof imagePath === "string") {
    imageUrl = getImageUrl(imagePath);
  }


  const finalTotalAmount = lastAdded.totalAmount ?? totalAmount ?? 0;

  return (
    <div className="fixed top-24 right-4 z-40 pointer-events-none">
      <AnimatePresence>
        {showAddedPopup && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="
              pointer-events-auto
              w-[360px] max-w-sm
              rounded-2xl bg-white shadow-2xl border border-slate-200
            "
          >
            {/* Header con producto */}
            <div className="flex items-start gap-3 p-4 border-b border-slate-100">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                />
              )}

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">
                  ¡Agregado al carrito con éxito!
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {name}{" "}
                  <span className="font-normal text-slate-500">x {qty}</span>
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  ${price.toLocaleString("es-AR")}
                </p>
              </div>

              <button
                onClick={closeAddedPopup}
                className="ml-1 text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Footer con total y botón */}
            <div className="px-4 py-3 text-sm text-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">
                  Total ({totalItems} producto
                  {totalItems === 1 ? "" : "s"}):
                </span>
                <p className="font-semibold text-slate-900">
                  ${finalTotalAmount.toLocaleString("es-AR")}
                </p>
              </div>

              <button
                onClick={() => {
                  closeAddedPopup();
                  navigate("/cart");
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Ver carrito
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}