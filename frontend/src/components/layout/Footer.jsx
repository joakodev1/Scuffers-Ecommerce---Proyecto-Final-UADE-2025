// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Music2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Newsletter from "../Newsletter.jsx";

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

export default function Footer() {
  return (
    <footer className="mt-0 bg-white text-slate-800 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Newsletter global */}
        <div className="max-w-5xl mx-auto">
          <Newsletter />
        </div>

        {/* Línea divisoria + contenido inferior */}
        <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-slate-500">
          {/* Links secundarios */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-700">Scuffers</span>
            <Link
              to="/shop"
              className="hover:text-slate-900 hover:underline underline-offset-4"
            >
              Shop
            </Link>
            <Link
              to="/contact"
              className="hover:text-slate-900 hover:underline underline-offset-4"
            >
              Contacto
            </Link>
            <a
              href="mailto:scuffersuade@gmail.com"
              className="inline-flex items-center gap-1 hover:text-slate-900 hover:underline underline-offset-4"
            >
              <Mail size={14} /> Soporte
            </a>
          </div>

          {/* Redes sociales */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ Icon, label }) => (
              <motion.button
                key={label}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                aria-label={label}
              >
                <Icon size={16} />
              </motion.button>
            ))}
          </div>

          {/* Créditos */}
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Scuffers. Proyecto final e-commerce
            desarrollado con React & Django.
          </p>
        </div>
      </div>
    </footer>
  );
}