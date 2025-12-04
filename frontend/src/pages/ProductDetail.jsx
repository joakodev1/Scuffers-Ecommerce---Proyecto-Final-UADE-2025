// src/pages/ProductDetail.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../auth/AuthContext.jsx";
import { fetchProductBySlug, getImageUrl } from "../api/products.js";
import { useCart } from "../cart/CartContext.jsx";

const SIZES = ["S", "M", "L", "XL"];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  const [openPayment, setOpenPayment] = useState(false);
  const [openShipping, setOpenShipping] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProductBySlug(slug);
        setProduct(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Producto no encontrado");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const category = (product?.categoria || "").toLowerCase();

  const needsSize = [
    "remera",
    "remeras",
    "buzo",
    "buzos",
    "campera",
    "camperas",
    "hoodie",
    "hoodies",
    "pantalon",
    "pantalones",
    "pants",
    "abrigo",
    "abrigos",
    "camisa",
    "camisas",
  ].some((kw) => category.includes(kw));

  const showSizeSelector = needsSize;

  // ---------------- AGREGAR AL CARRITO ----------------
  async function handleAdd() {
    if (!isAuthenticated) {
      return navigate(`/login?next=/product/${slug}`);
    }
    if (!product) return;

    const identifier = product.slug;

    if (needsSize && !selectedSize) {
      setError("Seleccioná un talle antes de agregar al carrito.");
      return;
    }

    try {
      setAdding(true);
      setError("");

      await addToCart(identifier, 1, needsSize ? selectedSize : null);
    } catch (err) {
      console.error("Error agregando al carrito:", err);
      setError("No se pudo agregar al carrito.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (error && !product) return <div className="p-10 text-center">{error}</div>;

  // ---------------- IMÁGENES ----------------
  const rawImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [
          product.image_url,
          product.image_hover_url,
          product.imagen,
          product.imagen_hover,
          product.imagen_3,
          product.imagen_4,
        ].filter(Boolean);

  const images = rawImages.slice(0, 4).map((img) => getImageUrl(img));

  const buttonLabel = adding ? "Agregando..." : "Agregar al carrito";
  const buttonDisabled = adding || (needsSize && !selectedSize);

  return (
    <div className="w-full max-w-[1500px] mx-auto px-6 py-10 mt-24">
      <Link to="/shop" className="text-sm opacity-60 hover:opacity-100">
        ← Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-6">
        {/* IMÁGENES */}
        <div className="grid grid-cols-2 gap-6">
          {images.map((src, i) => (
            <div
              key={i}
              className="bg-white rounded overflow-hidden flex items-center justify-center"
            >
              <img
                src={src}
                alt={`${product.nombre} ${i + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* INFO */}
        <div className="flex flex-col gap-6">
          <div className="text-xs tracking-wide text-gray-500 uppercase">
            {product.categoria}
          </div>

          <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
            {product.nombre}
          </h1>

          <div className="text-2xl font-semibold">
            ${Number(product.precio).toLocaleString("es-AR")}
          </div>

          {/* SELECTOR DE TALLES */}
          {showSizeSelector && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Talle</p>
              <div className="flex gap-3">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setError("");
                    }}
                    className={`px-4 py-2 border rounded-full text-sm transition
                      ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "bg-white border-gray-300 text-gray-700 hover:border-black"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

          {/* BOTÓN */}
          <button
            onClick={handleAdd}
            disabled={buttonDisabled}
            className={`w-full bg-[#0B132B] hover:bg-[#121b35] text-white py-4 rounded-full mt-4 shadow-lg transition-all
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {buttonLabel}
          </button>

          {/* ACORDEONES */}
          <div className="mt-8 border-t pt-6">
            {/* Medios de pago */}
            <div className="border-b py-4">
              <button
                type="button"
                onClick={() => setOpenPayment((v) => !v)}
                className="w-full flex items-center justify-between text-lg font-medium"
              >
                <span>Medios de pago</span>
                <span className="text-xl">{openPayment ? "−" : "+"}</span>
              </button>

              <AnimatePresence>
                {openPayment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm mt-2 opacity-80">
                      Aceptamos MercadoPago, tarjetas y transferencias.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Envíos */}
            <div className="border-b py-4">
              <button
                type="button"
                onClick={() => setOpenShipping((v) => !v)}
                className="w-full flex items-center justify-between text-lg font-medium"
              >
                <span>Envíos</span>
                <span className="text-xl">{openShipping ? "−" : "+"}</span>
              </button>

              <AnimatePresence>
                {openShipping && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm mt-2 opacity-80">
                      Envíos a todo el país.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}