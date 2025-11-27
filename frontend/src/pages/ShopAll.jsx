// src/pages/ShopAll.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchProducts } from "../api/products.js";
import { CATEGORY_LABELS } from "../data/products.js";

export default function ShopAll() {
  const [searchParams] = useSearchParams();

  const cat = searchParams.get("cat") || "";
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProducts({
          cat: cat || undefined,
          search: search || undefined,
        });

        const list = Array.isArray(data) ? data : data.results || [];
        setProducts(list);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cat, search]);

  return (
    <div className="min-h-screen bg-white px-4 pb-16">
      <div className="w-full mx-auto pt-12">
        <header className="mb-10"></header>

        {loading && (
          <p className="text-sm text-slate-600">Cargando productos...</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-sm text-slate-600">
            No se encontraron productos.
          </p>
        )}

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

            const mainImage =
              product.image || product.imagen || product.image_url;
            const hoverImage =
              product.image_hover || product.image || product.imagen || mainImage;

            return (
              <Link
                key={product.slug || product.id}
                // 👇 solo usamos el slug para la ruta del detalle
                to={`/product/${product.slug}`}
                className="block group"
              >
                <div className="cursor-pointer">
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
    </div>
  );
}