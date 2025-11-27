// src/components/layout/Footer.jsx (o donde lo tengas)
import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Music2, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitted(true);
    setEmail("");
  }

  const socialLinks = [
    {
      Icon: Instagram,
      label: "Instagram",
    },
    {
      Icon: Music2,
      label: "TikTok",
    },
    {
      Icon: Facebook,
      label: "Facebook",
    },
    {
      Icon: Youtube,
      label: "YouTube",
    },
  ];

  return (
    <footer className="mt-0 bg-white text-slate-800 border-t border-slate-200">
      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        {/* Columna 1: Marca + texto */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 p-2">
              <img
                src="/smile.png"
                alt="Scuffers logo"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div className="leading-tight">
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                Scuffers
              </p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Streetwear
              </p>
            </div>
          </div>

          <p className="max-w-md text-sm text-slate-600">
            Drops, básicos y piezas statement con fits relajados y materiales
            cómodos. Diseñados en Rosario, pensados para que armes tu mood
            Scuffers todos los días.
          </p>

          <a
            href="mailto:info@scuffers.com"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Mail size={16} />
            <span>info@scuffers.com</span>
          </a>

          <div className="pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Social Media
            </h3>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl 
                             bg-white border border-slate-200 text-slate-700
                             hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Shop */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Shop</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>
              <Link
                to="/shop"
                className="hover:text-slate-900 transition-colors"
              >
                Remeras
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="hover:text-slate-900 transition-colors"
              >
                Buzos / Camperas
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="hover:text-slate-900 transition-colors"
              >
                Pantalones
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="hover:text-slate-900 transition-colors"
              >
                Accesorios
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna Company */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>
              <Link
                to="/shop"
                className="hover:text-slate-900 transition-colors"
              >
                Shop All
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-slate-900 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* NEWSLETTER – BLOQUE CENTRAL */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4 }}
        className="border-t border-slate-200 bg-slate-50/60"
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              Suscribite a los drops de Scuffers
            </h3>
            <p className="text-sm text-slate-600">
              Enterate primero de nuevos lanzamientos, restocks y promos
              exclusivas. Nada de spam, solo streetwear.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-2 flex flex-col sm:flex-row items-center gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitted) setSubmitted(false);
                }}
                placeholder="Tu email"
                className="w-full sm:flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm 
                           outline-none focus:ring-2 focus:ring-slate-900/70 focus:border-slate-900/70
                           placeholder:text-slate-400"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 
                           text-sm font-medium text-white shadow-sm shadow-slate-900/20 
                           hover:bg-slate-800 transition-colors"
              >
                Suscribirme
              </motion.button>
            </form>

            {submitted && (
              <p className="text-xs text-emerald-600 mt-1">
                ¡Gracias por suscribirte! Más adelante conectamos esto para que
                te lleguen novedades reales de Scuffers 💌
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* LÍNEA INFERIOR */}
      <div className="border-t border-slate-200 bg-slate-50/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[12px] text-slate-500">
            © {new Date().getFullYear()} Scuffers — All rights reserved.
          </p>
          <p className="text-[12px] text-slate-500">Proyecto Final UADE 2025</p>
        </div>
      </div>
    </footer>
  );
}