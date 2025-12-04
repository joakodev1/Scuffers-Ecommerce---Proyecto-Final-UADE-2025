// src/components/ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const images = product.images || [];
  const primaryImage = images[0];
  const secondaryImage = images[1] || images[0]; 

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
    >
      {/* CONTENEDOR IMAGEN CON HOVER */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
        {/* Imagen principal */}
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
        {/* Segunda imagen (hover) */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>

      {/* INFO DEL PRODUCTO */}
      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {product.category_name}
        </p>
        <p className="text-sm font-medium text-slate-900">
          {product.name}
        </p>
        <p className="text-sm text-slate-700">
          ${product.price}
        </p>
      </div>
    </Link>
  );
}