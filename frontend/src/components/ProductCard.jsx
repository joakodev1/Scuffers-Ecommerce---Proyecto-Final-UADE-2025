// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { getImageUrl } from "../api/products.js";

export default function ProductCard({ product }) {
  const image = getImageUrl(product.image || product.imagen);
  const hoverImage = getImageUrl(product.image_hover || product.imagen_hover);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200"
    >
      <div className="bg-slate-100/80">
        <div className="aspect-[4/5] w-full overflow-hidden">
          <img
            src={image}
            alt={product.nombre}
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt={product.nombre}
              className="h-full w-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>
      </div>

      <div className="px-4 pt-2 pb-4 space-y-1.5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          {product.categoria || "Producto"}
        </p>

        <h3 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">
          {product.nombre}
        </h3>

        <p className="text-sm font-semibold text-slate-900">
          ${Number(product.precio).toLocaleString("es-AR")}
        </p>
      </div>
    </Link>
  );
}