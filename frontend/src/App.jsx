// src/App.jsx
import { Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop.jsx";

// ======== ADMIN DASHBOARD ========
import AdminOrderDetail from "./admin/AdminOrderDetail.jsx";
import DashboardLayout from "./admin/DashboardLayout";
import DashboardHome from "./admin/DashboardHome";
import ProductsList from "./admin/ProductsList";
import OrdersList from "./admin/OrdersList";
import UsersList from "./admin/UsersList";
import AdminRoute from "./auth/AdminRoute";

// ======== PUBLIC LAYOUT ========
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

import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import CheckoutFailure from "./pages/CheckoutFailure.jsx";
import CheckoutPending from "./pages/CheckoutPending.jsx";

// USER ORDERS
import MyOrders from "./pages/MyOrders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>

        {/* ================= PUBLIC ROUTES WITH LAYOUT ================= */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopAll />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* PROTECTED USER ROUTES */}
          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ================= ADMIN DASHBOARD ================= */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="users" element={<UsersList />} />
          </Route>

        {/* ================= AUTH PAGES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= MERCADO PAGO ================= */}
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/failure" element={<CheckoutFailure />} />
        <Route path="/checkout/pending" element={<CheckoutPending />} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}