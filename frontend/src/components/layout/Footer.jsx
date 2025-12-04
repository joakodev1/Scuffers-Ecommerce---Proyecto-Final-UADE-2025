// src/components/layout/Footer.jsx (o donde lo tengas)
import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Music2, Mail } from "lucide-react";
import Newsletter from "../Newsletter.jsx";

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

  const LOGO_LIGHT = "/logolight.png";   // blanco para arriba del hero
const LOGO_DARK = "/logoremove.png";   // negro para header blanco

  return (
    <footer className="mt-0 bg-white text-slate-800 border-t border-slate-200">

     <div className="max-w-5xl mx-auto px-4">
    <Newsletter />
  </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        {/* Columna 1: Marca + texto */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 p-2">
              <img
                src="/logoremove.png"
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