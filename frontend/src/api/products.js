// src/api/products.js

// Base para API REST
export const API_URL = "http://localhost:8000/api";

// Base para imágenes
export const API_BASE_URL = "http://localhost:8000";

// Convierte una ruta de imagen en URL completa
export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

// Intenta detectar la propiedad correcta de imagen del objeto que viene del backend
function extractImagePath(obj = {}) {
  return (
    obj.imagen ||        // español
    obj.image ||         // inglés
    obj.image_url ||     // algunas APIs
    obj.foto ||          // por las dudas
    ""
  );
}

// 🔹 Lista de productos
export async function fetchProducts({ cat, search } = {}) {
  let url = `${API_URL}/products/`;

  const params = new URLSearchParams();
  if (cat) params.append("cat", cat);
  if (search) params.append("search", search);

  const qs = params.toString();
  if (qs) {
    url += `?${qs}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al obtener productos");
  }

  const data = await res.json();
  console.log("Productos desde API (LIST):", data);

  // Normalizamos la imagen de todos los productos
  return data.map((p) => {
    const rawPath = extractImagePath(p);
    return {
      ...p,
      imagen: getImageUrl(rawPath),
    };
  });
}

// 🔹 Detalle de producto por slug
export async function fetchProductBySlug(slug) {
  // 🔧 limpiamos el slug por las dudas
  const cleanSlug = encodeURIComponent(String(slug || "").split("/")[0].trim());

  const url = `${API_URL}/products/${cleanSlug}/`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error("Error al obtener el producto. Status:", res.status);
    throw new Error("Error al obtener el producto");
  }

  const data = await res.json();
  console.log("Producto desde API (DETALLE):", data);

  const rawPath = extractImagePath(data);

  return {
    ...data,
    imagen: getImageUrl(rawPath),
  };
}