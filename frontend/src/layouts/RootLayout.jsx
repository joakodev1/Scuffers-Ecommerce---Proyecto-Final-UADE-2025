// src/layouts/RootLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import Footer from "../components/layout/Footer.jsx";
import AddToCartPopup from "../components/AddToCartPopup.jsx";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Popup de agregado al carrito, debajo del header */}
      <AddToCartPopup />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}