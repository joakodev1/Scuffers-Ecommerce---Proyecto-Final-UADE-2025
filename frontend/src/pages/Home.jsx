// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Hero from "../components/Hero.jsx";
import { fetchProducts } from "../api/products.js";
import { CATEGORY_LABELS } from "../data/products.js";
import Newsletter from "../components/Newsletter.jsx";

function FeaturedProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProducts({});
        const list = Array.isArray(data) ? data : data.results || [];
        setProducts(list.slice(0, 10));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos destacados.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="bg-white border-t border-slate-200">
      {/* Contenedor más compacto */}
      <div className="w-full mx-auto px-4 py-8">
        {/* HEADER: título, logo centrado y link */}
        <div className="flex items-center justify-between mb-6 relative">
          {/* Título izquierda */}
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
            Productos destacados
          </h2>

          {/* Logo exactamente en el centro de la fila */}
          <motion.img
            src="/smile.png"
            alt="Scuffers logo"
            className="h-9 w-9 opacity-50 pointer-events-none absolute left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Link derecha */}
          <Link
            to="/shop"
            className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
          >
            Ver todo el catálogo →
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-600">Cargando productos...</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-sm text-slate-600">
            No se encontraron productos destacados.
          </p>
        )}

        {/* GRILLA DE PRODUCTOS */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-x-4
            gap-y-8
          "
        >
          {products.map((product) => {
            const priceNumber = Number(product.precio ?? 0);

            const imagesArray =
              product.images && product.images.length > 0
                ? product.images
                : [product.image, product.image_hover].filter(Boolean);

            const mainImage = product.image || imagesArray[0];
            const hoverImage =
              product.image_hover || imagesArray[1] || mainImage;

            return (
              <Link
                key={product.slug || product.id}
                to={`/product/${product.slug || product.id}`}
                className="block group"
              >
                <div className="cursor-pointer">
                  {/* Imagen principal + hover */}
                  <div className="relative w-full aspect-[4/5] bg-white overflow-hidden">
                    <img
                      src={mainImage}
                      alt={product.nombre}
                      className="
                        absolute inset-0 w-full h-full object-contain
                        transition-opacity duration-300
                        group-hover:opacity-0
                      "
                    />

                    {hoverImage && (
                      <img
                        src={hoverImage}
                        alt=""
                        className="
                          absolute inset-0 w-full h-full object-contain
                          opacity-0
                          transition-opacity duration-300
                          group-hover:opacity-100
                        "
                      />
                    )}
                  </div>

                  {/* Textos */}
                  <div className="mt-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      {CATEGORY_LABELS[product.categoria] || product.categoria}
                    </p>

                    <p className="mt-1 text-[13px] font-medium leading-tight text-slate-900 line-clamp-2">
                      {product.nombre}
                    </p>

                    <p className="mt-1 text-[13px] font-semibold text-slate-900">
                      ${priceNumber.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Hero />
      <FeaturedProductsSection />
    </main>
  );
}