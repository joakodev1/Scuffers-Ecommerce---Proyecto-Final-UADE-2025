// src/components/layout/Header.jsx
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useCart } from "../../cart/CartContext.jsx";

const MotionLink = motion(Link);

// Rutas principales (sin Categories, que va aparte)
const navItems = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop All" },
  { to: "/contact", label: "Contact" },
];

const announcements = [
  "3 CUOTAS SIN INTERES",
  "ENVIO GRATIS SUPERANDO LOS $150.000",
  "20% OFF VIA TRANSFERENCIA",
  "3 CUOTAS SIN INTERES",
  "ENVIO GRATIS SUPERANDO LOS $150.000",
  "20% OFF VIA TRANSFERENCIA",
];

// Tus categorías reales
const categoryLinks = [
  { label: "Camperas / Buzos", to: "/shop?cat=hoodies" },
  { label: "Pantalones", to: "/shop?cat=pants" },
  { label: "Remeras", to: "/shop?cat=tees" },
  { label: "Accesorios", to: "/shop?cat=accessories" },
];

// logos en /public
const LOGO_LIGHT = "/logolight.png"; // blanco para arriba del hero
const LOGO_DARK = "/logoremove.png"; // negro para header blanco

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [headerPhase, setHeaderPhase] = useState("large"); // large | compactHero | scrolled

  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  const { isAuthenticated, logout, loading, user } = useAuth(); // 👈 agregamos user
  const { totalItems } = useCart();

  const isHome = location.pathname === "/";

  // --- fases de header según scroll (sólo en Home) ---
  useEffect(() => {
    if (!isHome) {
      setHeaderPhase("scrolled");
      return;
    }

    function handleScroll() {
      const y = window.scrollY || 0;

      if (y < 40) {
        setHeaderPhase("large"); // top del hero
      } else if (y < 260) {
        setHeaderPhase("compactHero"); // un poco de scroll, todavía en hero
      } else {
        setHeaderPhase("scrolled"); // ya saliste del hero
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const effectivePhase = isHome ? headerPhase : "scrolled";
  const isScrolled = effectivePhase === "scrolled";

  // sombra suave cuando se scrollea
  const boxShadow = useTransform(
    scrollY,
    [0, 120],
    ["0 0 0 rgba(0,0,0,0)", "0 12px 30px rgba(15,23,42,0.18)"]
  );

  // logo según fase
  const logoSrc =
    effectivePhase === "large" || effectivePhase === "compactHero"
      ? LOGO_LIGHT
      : LOGO_DARK;

  return (
    <motion.header
      style={{ boxShadow }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        isScrolled
          ? "bg-white/95 border-b border-slate-200"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* BARRA PROMO ARRIBA */}
      <div className="w-full bg-sky-900 text-[10px] sm:text-xs text-slate-50 border-b border-sky-800/40 overflow-hidden">
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
      <div
        className={`relative w-full flex items-center px-4 sm:px-6 transition-all duration-300 ${
          effectivePhase === "large" ? "h-20" : "h-16"
        }`}
      >
        {/* IZQUIERDA DESKTOP: Categories + nav */}
        <div className="hidden md:flex flex-1 items-center justify-start gap-4">
          {/* BOTÓN CATEGORIES */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-medium transition-colors border ${
                isScrolled
                  ? "bg-white text-slate-800 border-slate-200 hover:bg-slate-100"
                  : "bg-black/35 text-slate-50 border-white/30 hover:bg-black/45"
              }`}
            >
              <span>Categories</span>
              <span className="text-[10px]">{categoriesOpen ? "▲" : "▼"}</span>
            </button>

            {/* DROPDOWN DESKTOP */}
            <AnimatePresence>
              {categoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 6, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 mt-1 w-64 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden z-50"
                >
                  {categoryLinks.map((cat, idx) => (
                    <Link
                      key={cat.label}
                      to={cat.to}
                      onClick={() => setCategoriesOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 ${
                        idx !== categoryLinks.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700">
                        {cat.label[0]}
                      </span>
                      <span className="text-slate-800">{cat.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NAV LINKS */}
          <nav className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 shadow-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium transition-colors ${
                    isScrolled
                      ? isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      : isActive
                      ? "bg-black/40 text-white"
                      : "text-slate-100/90 hover:bg-black/40 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* LOGO CENTRADO */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center"
        >
          <motion.img
            src={logoSrc}
            alt="Scuffers"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            className={`h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-md ${
              isScrolled ? "brightness-100" : "brightness-110"
            } ${
              effectivePhase === "large" ? "scale-100" : "scale-95"
            } transition-transform`}
          />
        </Link>

        {/* DERECHA DESKTOP: carrito + auth (+ admin) */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-3">
          {/* CARRITO */}
          <Link
            to="/cart"
            className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors ${
              isScrolled
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                : "border-white/30 bg-black/35 text-slate-50 hover:bg-black/45"
            }`}
          >
            <ShoppingBag size={16} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-900 text-[10px] font-semibold text-white flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* AUTH */}
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  {/* 👑 Admin desktop - solo staff */}
                  {user?.is_staff && (
                    <Link
                      to="/dashboard"
                      className="px-3 py-1 text-xs md:text-sm rounded-full bg-amber-500 text-white hover:bg-amber-600 font-medium"
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    to="/mi-cuenta"
                    className={`px-3 py-1 text-xs md:text-sm rounded-full border transition-colors ${
                      isScrolled
                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        : "border-white/30 bg-black/35 text-slate-50 hover:bg-black/45"
                    }`}
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
                    className="px-4 py-1 text-xs md:text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800"
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
                      className={`px-3 py-1 text-xs md:text-sm rounded-full border transition-colors ${
                        isScrolled
                          ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          : "border-white/30 bg-black/35 text-slate-50 hover:bg-black/45"
                      }`}
                    >
                      Log in
                    </motion.button>
                  </Link>

                  <MotionLink
                    to="/register"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-1 text-xs md:text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Register
                  </MotionLink>
                </>
              )}
            </>
          )}
        </div>

        {/* BOTÓN MENU MOBILE */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* NAV MOBILE */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden px-4 pb-4 bg-white/95"
        >
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-md p-3 space-y-1">
            {/* Categories en mobile */}
            <div className="space-y-1">
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

            {/* Resto de nav items */}
            {navItems.map((item) => (
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
            ))}

            {/* Carrito mobile */}
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
              <div className="pt-2 mt-2 border-t border-slate-200 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* 👑 Admin mobile - solo staff */}
                    {user?.is_staff && (
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white text-center hover:bg-amber-600"
                      >
                        Admin
                      </Link>
                    )}

                    <div className="flex gap-2">
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
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2">
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
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}