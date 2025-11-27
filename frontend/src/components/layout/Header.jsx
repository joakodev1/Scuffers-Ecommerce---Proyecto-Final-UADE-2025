// src/components/layout/Header.jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useCart } from "../../cart/CartContext.jsx";

const MotionLink = motion(Link);

const navItems = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop All" },
  { to: "/shop", label: "Categories" },
  { to: "/contact", label: "Contact" },
];

const announcements = [
  "3 CUOTAS SIN INTERES",
  "ENVIO GRATIS SUPERANDO LOS $150.000",
  "20% OFF VIA TRANSFERENCIA",
  "3 CUOTAS SIN INTERES",
  "ENVIO GRATIS SUPERANDO LOS $150.000",
  "20% OFF VIA TRANSFERENCIA",
  "3 CUOTAS SIN INTERES",
  "ENVIO GRATIS SUPERANDO LOS $150.000",
  "20% OFF VIA TRANSFERENCIA",
];

const categoryLinks = [
  { label: "Camperas / Buzos", to: "/shop?cat=hoodies" },
  { label: "Pantalones", to: "/shop?cat=abrigos" },
  { label: "Remeras", to: "/shop?cat=camisas" },
  { label: "Accesorios", to: "/shop?cat=carteras" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const { isAuthenticated, logout, loading } = useAuth();
  const { totalItems } = useCart();

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
  }

  // 🔽 Animaciones con scroll
  const boxShadow = useTransform(
    scrollY,
    [0, 80],
    ["0 0 0 rgba(15,23,42,0)", "0 18px 45px rgba(15,23,42,0.16)"]
  );

  const bgColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(248,250,252,0)", "rgba(248,250,252,0.98)"]
  );

  const borderColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(148,163,184,0)", "rgba(148,163,184,0.7)"]
  );

  return (
    <motion.header
      style={{ boxShadow, backgroundColor: bgColor, borderColor }}
      className="fixed inset-x-0 top-0 z-40 border-b backdrop-blur-xl"
    >
      {/* BARRA PROMO */}
      <div className="w-full bg-sky-800 text-[10px] sm:text-xs text-slate-50 border-b border-sky-800/40 overflow-hidden">
        <motion.div
          className="flex items-center gap-8 whitespace-nowrap py-1"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          }}
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8">
              {announcements.map((msg, idx) => (
                <span
                  key={`${i}-${idx}`}
                  className="tracking-[0.18em] uppercase text-sky-50/90"
                >
                  {msg}
                  <span className="mx-3 text-sky-200">//</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* HEADER PRINCIPAL */}
      <div className="relative h-16 w-full flex items-center px-6">

        {/* NAV DESKTOP */}
        <div className="hidden md:flex flex-1 items-center justify-start">
          <nav className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-sm ring-1 ring-slate-200/80">
            {navItems.map((item) =>
              item.label === "Categories" ? (
                <button
                  key="categories-desktop"
                  type="button"
                  onClick={() => setCategoriesOpen((v) => !v)}
                  className={`relative px-4 py-1 text-sm rounded-full transition-colors ${
                    categoriesOpen
                      ? "text-slate-900 bg-slate-100/80"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <span className="inline-flex flex-col items-center">
                    <span>Categories</span>
                    {categoriesOpen && (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-slate-900" />
                    )}
                  </span>
                </button>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-4 py-1 text-sm rounded-full transition-colors ${
                      isActive
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>
        </div>

        {/* LOGO */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center"
        >
          <motion.div
            className="flex items-center gap-2 md:gap-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              whileHover={{ rotate: -3, scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 p-1.5"
            >
              <img
                src="/smile.png"
                alt="Scuffers Logo"
                className="h-9 w-9 md:h-10 md:w-10 object-contain"
              />
            </motion.div>

            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-base md:text-lg font-semibold tracking-tight text-slate-900">
                Scuffers
              </span>
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Streetwear
              </span>
            </div>
          </motion.div>
        </Link>

        {/* ICONOS */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-3">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            <Search size={16} />
          </button>

          <Link
            to="/cart"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            <ShoppingBag size={16} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-900 text-[10px] font-semibold text-white flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/mi-cuenta"
                    className="px-3 py-1 text-sm text-slate-700 rounded-full border border-slate-200 bg-white hover:bg-slate-100"
                  >
                    Mi cuenta
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="px-4 py-1 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Cerrar sesión
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3 py-1 text-sm text-slate-700 rounded-full border border-slate-200 bg-white hover:bg-slate-100"
                    >
                      Log in
                    </motion.button>
                  </Link>

                  <MotionLink
                    to="/register"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-1 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Register
                  </MotionLink>
                </>
              )}
            </>
          )}
        </div>

        {/* ICONO MOBILE */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* BARRA CATEGORIAS DESKTOP */}
      <div
        className={`hidden md:block bg-white shadow-sm overflow-hidden transition-[max-height,opacity] duration-180 ease-out ${
          categoriesOpen ? "max-h-11 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto flex justify-between px-4 py-3 text-xs md:text-sm text-slate-800">
          {categoryLinks.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              className="hover:text-slate-900 hover:underline underline-offset-4"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* NAV MOBILE — ARREGLADO */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden px-4 pb-4"
        >
          <div className="rounded-2xl bg-white/95 ring-1 ring-slate-200 shadow-md p-3 space-y-1">

            {navItems.map((item) =>
              item.label === "Categories" ? (
                <div key="mobile-categories" className="space-y-1">
                  
                  {/* Botón principal */}
                  <button
                    onClick={() => setCategoriesOpen((v) => !v)}
                    className={`w-full block rounded-xl px-3 py-2 text-sm text-left ${
                      categoriesOpen
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Categories
                  </button>

                  {/* Submenú */}
                  {categoriesOpen && (
                    <div className="ml-3 space-y-1 border-l border-slate-200 pl-3">
                      {categoryLinks.map((cat) => (
                        <Link
                          key={cat.label}
                          to={cat.to}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-2 py-1.5 text-[13px] text-slate-600 hover:bg-slate-100"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            {/* Carrito */}
            <NavLink
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              Mi carrito
            </NavLink>

            {/* AUTH MOBILE */}
            {!loading && (
              <div className="pt-2 mt-2 border-t border-slate-200 flex gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/mi-cuenta"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 text-center"
                    >
                      Mi cuenta
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                        navigate("/");
                      }}
                      className="flex-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white text-center"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 text-center"
                    >
                      Log in
                    </Link>

                    <MotionLink
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white text-center"
                    >
                      Register
                    </MotionLink>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}