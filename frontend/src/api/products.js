// src/api/products.js
import { BASE_URL } from "./api.js";

// Base para API REST (con /api) — ahora es SIEMPRE Railway
export const API_URL = BASE_URL;

// Base para imágenes (sin /api)
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");

/**
 * Normaliza una ruta/URL de imagen a una URL absoluta usable en <img src="">
 */
export function getImageUrl(path) {
  if (!path) return "";

  const CLOUD_NAME = "dmkm2bduz";

  // Si es URL de Render con /media/products/, extraemos el nombre y lo mandamos a Cloudinary
  if (path.includes("/media/products/")) {
    const filename = path.split("/media/products/")[1];
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/products/${filename}`;
  }

  // Si ya es URL de Cloudinary, la dejamos
  if (path.startsWith("https://res.cloudinary.com")) {
    return path;
  }

  // Si es public_id relativo
  if (!path.startsWith("http")) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${path}`;
  }

  return path;
}

/**
 * Dado un objeto producto tal como viene del backend, intenta encontrar
 * la MEJOR URL de imagen de acuerdo a tu serializer:
 *
 *  - images[0] (galería)
 *  - image_url (URL principal)
 *  - imagen (ImageField crudo)
 *  - luego las variantes hover / 3 / 4
 */
function extractImagePath(obj = {}) {
  // 1) galería: [imagen, imagen_hover, imagen_3, imagen_4]
  if (Array.isArray(obj.images) && obj.images.length > 0) {
    return obj.images[0];
  }

  // 2) URL derivada principal
  if (obj.image_url) return obj.image_url;

  // 3) campos de archivo crudos
  if (obj.imagen) return obj.imagen;
  if (obj.imagen_hover) return obj.imagen_hover;
  if (obj.imagen_3) return obj.imagen_3;
  if (obj.imagen_4) return obj.imagen_4;

  // 4) otras URLs derivadas por si acaso
  if (obj.image_hover_url) return obj.image_hover_url;
  if (obj.image_3_url) return obj.image_3_url;
  if (obj.image_4_url) return obj.image_4_url;

  // fallback ultra-genérico
  return obj.image || obj.image_url || obj.foto || "";
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

  // Normalizamos SIEMPRE un campo "imagen" listo para usar
  return data.map((p, index) => {
    const rawPath = extractImagePath(p);
    const finalUrl = getImageUrl(rawPath);

    // debug rápido por si algo raro pasa
    if (index === 0) {
      console.log("DEBUG IMG PRODUCTO[0]:", {
        rawPath,
        finalUrl,
        images: p.images,
        image_url: p.image_url,
        imagen: p.imagen,
      });
    }

    return {
      ...p,
      imagen: finalUrl,
    };
  });
}

// 🔹 Detalle de producto por slug
export async function fetchProductBySlug(slug) {
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
  const finalUrl = getImageUrl(rawPath);

  return {
    ...data,
    imagen: finalUrl,
  };
}