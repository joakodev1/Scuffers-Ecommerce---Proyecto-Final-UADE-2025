// src/cart/CartContext.jsx
import { createContext, useContext, useState } from "react";
import {
  getMyCart,
  addToCart as apiAdd,
  removeFromCart as apiRemove,
} from "../api/cart.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);   // cargar carrito
  const [updating, setUpdating] = useState(false); // sumar / restar
  const [error, setError] = useState("");

  // Cargar carrito completo desde el backend
  async function refreshCart() {
    try {
      setLoading(true);
      setError("");
      const data = await getMyCart();
      setCart(data);
    } catch (err) {
      console.error(
        "Error al cargar carrito (context):",
        err?.response?.data || err
      );
      setCart(null);
      setError(
        err?.response?.data?.detail || "No se pudo cargar el carrito."
      );
    } finally {
      setLoading(false);
    }
  }

  // Agregar unidades (con talle opcional)
  async function addToCart(productSlug, quantity = 1, size = null) {
    try {
      setUpdating(true);
      setError("");
      const data = await apiAdd(productSlug, quantity, size);
      setCart(data);
    } catch (err) {
      console.error(
        "Error al agregar al carrito:",
        err?.response?.data || err
      );
      setError(
        err?.response?.data?.detail ||
          "No se pudo agregar el producto al carrito."
      );
      throw err;
    } finally {
      setUpdating(false);
    }
  }

  // Restar unidades / eliminar (con talle opcional)
  async function removeFromCart(productSlug, quantity = 1, size = null) {
    try {
      setUpdating(true);
      setError("");
      const data = await apiRemove(productSlug, quantity, size);
      setCart(data);
    } catch (err) {
      console.error(
        "Error al quitar del carrito:",
        err?.response?.data || err
      );
      setError(
        err?.response?.data?.detail ||
          "No se pudo quitar el producto del carrito."
      );
      throw err;
    } finally {
      setUpdating(false);
    }
  }

  const totalItems = cart?.total_items || 0;

  const value = {
    cart,
    loading,
    updating,
    error,
    totalItems,
    refreshCart,
    addToCart,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}