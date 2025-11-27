// src/api/cart.js
import api from "./client.js";

// Obtener carrito del usuario logueado
export async function getMyCart() {
  const res = await api.get("/cart/my/");
  return res.data;
}

// Agregar producto al carrito (soporta talle opcional)
export async function addToCart(productSlug, quantity = 1, size = null) {
  const payload = {
    product_slug: productSlug,
    quantity,
  };

  if (size) {
    payload.size = size; // el backend acepta size o talle
  }

  const res = await api.post("/cart/add/", payload);
  return res.data; // devuelve el carrito actualizado
}

// Restar unidades / eliminar producto del carrito
export async function removeFromCart(productSlug, quantity = 1, size = null) {
  const payload = {
    product_slug: productSlug,
    quantity,
  };

  if (size) {
    payload.size = size;
  }

  const res = await api.post("/cart/remove/", payload);
  return res.data;
}

// Helper por si querés restar solo 1
export async function removeOneFromCart(productSlug, size = null) {
  return removeFromCart(productSlug, 1, size);
}