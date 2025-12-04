// src/pages/ShopAll.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import { fetchProducts, getImageUrl } from "../api/products.js";
import { CATEGORY_LABELS } from "../data/products.js";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ShopAll() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { addToCart, updating } = useCart();
  const { isAuthenticated } = useAuth();

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

  async function handleQuickAdd(e, product) {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?next=/product/${product.slug}`);
      return;
    }
    try {
      await addToCart(product.slug, 1, null);
    } catch (err) {
      console.error("Error en quick add:", err);
    }
  }

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

            // Preferimos la galería `images` que arma el serializer
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

            const mainImage = rawImages[0] ? getImageUrl(rawImages[0]) : null;
            const hoverImage = rawImages[1]
              ? getImageUrl(rawImages[1])
              : mainImage;

            return (
              <Link
                key={product.slug || product.id}
                to={`/product/${product.slug}`}
                className="block group"
              >
                <div className="cursor-pointer">
                  <div className="relative w-full aspect-[4/5] bg-white overflow-hidden">
                    {mainImage && (
                      <img
                        src={mainImage}
                        alt={product.nombre}
                        className="
                          absolute inset-0 w-full h-full object-contain
                          transition-opacity duration-300
                          group-hover:opacity-0
                        "
                      />
                    )}

                    {hoverImage && (
                      <img
                        src={hoverImage}
                        alt={`${product.nombre} 2`}
                        className="
                          absolute inset-0 w-full h-full object-contain
                          opacity-0
                          transition-opacity duration-300
                          group-hover:opacity-100
                        "
                      />
                    )}
                  </div>

                  {/* INFO PRODUCTO */}
                  <div className="mt-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      {CATEGORY_LABELS[product.categoria] ||
                        product.categoria}
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