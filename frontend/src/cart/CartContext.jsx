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
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");


  const [lastAdded, setLastAdded] = useState(null);
  const [showAddedPopup, setShowAddedPopup] = useState(false);


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


  async function addToCart(productSlug, quantity = 1, size = null) {
    try {
      setUpdating(true);
      setError("");
      const data = await apiAdd(productSlug, quantity, size);
      setCart(data);


      const items = data?.items || [];
      const item = items.find((it) => {

        const prod = it.producto || it.product || it.product_data || {};
        return (
          prod.slug === productSlug ||
          it.slug === productSlug
        );
      });

      const totalItems = data?.total_items ?? data?.totalItems ?? 0;
      const totalAmount =
        data?.total_price ??
        data?.totalAmount ??
        items.reduce((acc, it) => {
          const prod = it.producto || it.product || it.product_data || {};
          const qty = it.cantidad ?? it.quantity ?? 1;
          const price = prod.precio ?? prod.price ?? 0;
          return acc + qty * price;
        }, 0);

      setLastAdded({
        item,
        totalItems,
        totalAmount,
      });

      if (item) {
        setShowAddedPopup(true);
      }
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

  const totalAmount =
    cart?.total_price ??
    cart?.totalAmount ??
    (cart?.items || []).reduce((acc, it) => {
      const prod = it.producto || it.product || it.product_data || {};
      const qty = it.cantidad ?? it.quantity ?? 1;
      const price = prod.precio ?? prod.price ?? 0;
      return acc + qty * price;
    }, 0);

  const value = {
    cart,
    loading,
    updating,
    error,
    totalItems,
    totalAmount,

    refreshCart,
    addToCart,
    removeFromCart,


    lastAdded,
    showAddedPopup,
    closeAddedPopup: () => setShowAddedPopup(false),
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