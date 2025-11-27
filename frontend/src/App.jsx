// src/App.jsx
import { Routes, Route } from "react-router-dom";

import RootLayout from "./layouts/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import ShopAll from "./pages/ShopAll.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import MyAccount from "./pages/MyAccount.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ContactPage from "./pages/Contact.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";

import ScrollToTop from "./components/ScrollToTop.jsx";

export default function App() {
  return (
    <>
      {/* 🔝 Siempre que cambie la ruta, sube al top */}
      <ScrollToTop />

      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopAll />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Mi cuenta protegida */}
          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            }
          />

          {/* 🛒 Mi carrito protegido */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Rutas sin layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}