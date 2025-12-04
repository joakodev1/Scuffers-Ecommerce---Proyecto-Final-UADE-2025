// src/components/ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  // Usamos la galería ya normalizada por el serializer
  const images = product.images || [];

  const primaryImage = images[0] || product.image_url || product.imagen;
  const secondaryImage = images[1] || primaryImage;

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      {/* CONTENEDOR IMAGEN */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
        {/* Imagen principal */}
        <img
          src={primaryImage}
          alt={product.nombre}
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />

        {/* Imagen hover */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={product.nombre}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>

      {/* INFO DEL PRODUCTO */}
      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {product.categoria}
        </p>

        <p className="text-sm font-medium text-slate-900">
          {product.nombre}
        </p>

        <p className="text-sm text-slate-700">
          ${product.precio}
        </p>
      </div>
    </Link>
  );
}