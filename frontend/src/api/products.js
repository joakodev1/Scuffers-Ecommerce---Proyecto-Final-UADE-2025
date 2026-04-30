// src/api/products.js
import { BASE_URL } from "./api.js";
 
export const API_URL = BASE_URL;
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");
 
/**
 * Normaliza una ruta/URL de imagen a una URL absoluta usable en <img src="">
 */
export function getImageUrl(path) {
  if (!path) return "";
 
  const CLOUD_NAME = "dmkm2bduz";
 
  if (path.includes("/media/products/")) {
    const filename = path.split("/media/products/")[1];
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/products/${filename}`;
  }
 
  if (path.startsWith("https://res.cloudinary.com")) {
    return path;
  }
 
  if (!path.startsWith("http")) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${path}`;
  }
 
  return path;
}
 
function extractImagePath(obj = {}) {
  if (Array.isArray(obj.images) && obj.images.length > 0) return obj.images[0];
  if (obj.image_url) return obj.image_url;
  if (obj.imagen) return obj.imagen;
  if (obj.imagen_hover) return obj.imagen_hover;
  if (obj.imagen_3) return obj.imagen_3;
  if (obj.imagen_4) return obj.imagen_4;
  if (obj.image_hover_url) return obj.image_hover_url;
  if (obj.image_3_url) return obj.image_3_url;
  if (obj.image_4_url) return obj.image_4_url;
  return obj.image || obj.image_url || obj.foto || "";
}
 
// 🔹 Lista de productos
export async function fetchProducts({ cat, search } = {}) {
  let url = `${API_URL}/products/`;
 
  const params = new URLSearchParams();
  if (cat) params.append("cat", cat);
  if (search) params.append("search", search);
 
  const qs = params.toString();
  if (qs) url += `?${qs}`;
 
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener productos");
 
  const data = await res.json();
 
  return data.map((p) => {
    const rawPath = extractImagePath(p);
    const finalUrl = getImageUrl(rawPath);
    return { ...p, imagen: finalUrl };
  });
}
 
// 🔹 Detalle de producto por slug
export async function fetchProductBySlug(slug) {
  const cleanSlug = encodeURIComponent(String(slug || "").split("/")[0].trim());
  const url = `${API_URL}/products/${cleanSlug}/`;
  const res = await fetch(url);
 
  if (!res.ok) throw new Error("Error al obtener el producto");
 
  const data = await res.json();
  const rawPath = extractImagePath(data);
  const finalUrl = getImageUrl(rawPath);
 
  return { ...data, imagen: finalUrl };
}