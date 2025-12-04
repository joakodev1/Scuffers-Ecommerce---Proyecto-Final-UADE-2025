// src/components/Hero.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroVideo from "../assets/videos/heroscuffers.mp4";

const phrases = ["Somos Unicos", "Somos Diferentes", "Somos Scuffers"];

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // typewriter
  useEffect(() => {
    const current = phrases[phraseIndex];
    const speed = isDeleting ? 40 : 85;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const next = current.slice(0, displayed.length + 1);
        setDisplayed(next);

        if (next.length === current.length) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        const next = current.slice(0, displayed.length - 1);
        setDisplayed(next);

        if (next.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIndex]);

  return (

    <section className="relative h-[100vh] pt-[7rem] flex items-center overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/40 via-slate-950/15 to-slate-950/0" />

      {/* CONTENIDO */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 flex items-center">

        <div className="space-y-6 max-w-xl">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-sky-100 ring-1 ring-sky-300/50 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Nuevos drops FW·25 ya disponibles
          </motion.div>

          {/* TÍTULO CON TYPEWRITER */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-slate-50">
              {displayed}
              <span className="inline-block w-[1ch] animate-pulse text-sky-200">
                |
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight text-sky-200">
              Desde Argentina.
            </p>
          </div>

          {/* SUBTÍTULO */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm sm:text-base text-slate-100/90 max-w-xl"
          >
            Drops, básicos y piezas statement con fits relajados y materiales
            cómodos. Diseñados en Rosario, pensados para que armes tu mood
            Scuffers todos los días.
          </motion.p>

          {/* BOTÓN */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-wrap items-center gap-3"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.7)] hover:bg-slate-900 transition-colors"
              >
                Shop All
              </Link>
            </motion.div>
          </motion.div>

          {/* BENEFICIOS */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap gap-4 pt-2 text-[11px] text-slate-100/85"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              3 cuotas sin interés
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Envíos gratis +$150.000
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-100" />
              Hecho en Argentina
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}