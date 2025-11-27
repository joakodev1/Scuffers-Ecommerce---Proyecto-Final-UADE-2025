// src/pages/Contact.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import contactBg from "../assets/herotwohip.webp";
import { sendContactMessage } from "../api/contact.js"; // 👈 NUEVO

const COMPANY_EMAIL = "contacto@scuffers.com";

// Acordeón de FAQ
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b border-slate-200/70 py-4 cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex justify-between items-center gap-4">
        <h3 className="text-sm sm:text-base font-medium text-slate-800">
          {question}
        </h3>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-500 text-xs"
        >
          ▼
        </motion.span>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.22 }}
        className="overflow-hidden"
      >
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // null | "success" | "error"
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const { name, email, subject, message } = formData;

    // El backend espera solo "message", acá incluimos el asunto dentro del mensaje
    const finalMessage = subject
      ? `Asunto: ${subject}\n\n${message}`
      : message;

    try {
      await sendContactMessage({
        name,
        email,
        message: finalMessage,
      });

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="
        relative
        min-h-screen
        flex items-center
        overflow-hidden
        pt-24
        md:pt-28
      "
    >
      {/* BACKGROUND IMAGE (igual que el hero) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${contactBg})` }}
      />

      {/* CAPA OSCURA (mismo tono que el home) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/10" />

      {/* CONTENIDO */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 w-full flex flex-col gap-20 py-20">
        {/* HERO + FORM */}
        <div className="grid md:grid-cols-2 gap-16 items-center min-h-[60vh]">
          {/* IZQUIERDA */}
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-slate-700/60 bg-white/5 px-4 py-1 text-xs font-medium text-sky-100 shadow-sm backdrop-blur">
              Contact
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50">
              ¿Hablamos?
            </h1>

            <p className="text-sm md:text-base text-slate-100/85 max-w-md">
              Si tenés dudas sobre talles, envíos, drops o pedidos especiales,
              completá el formulario y nos contactamos a la brevedad.
            </p>

            <div className="space-y-1 text-sm">
              <p className="text-slate-200/80">También podés escribirnos a:</p>
              <a
                href={`mailto:${COMPANY_EMAIL}`}
                className="font-medium text-sky-300 hover:underline"
              >
                {COMPANY_EMAIL}
              </a>
            </div>
          </div>

          {/* FORM DERECHA */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-slate-200 backdrop-blur"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  required
                  onChange={handleChange}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Asunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                  placeholder="Ej: consulta sobre un envío"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none resize-none"
                  placeholder="Contanos en qué podemos ayudarte..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar mensaje"}
              </button>

              {status === "success" && (
                <p className="text-xs text-emerald-600 mt-2">
                  Mensaje enviado correctamente. Te vamos a responder a la
                  brevedad.
                </p>
              )}

              {status === "error" && (
                <p className="text-xs text-red-500 mt-2">
                  Hubo un error al enviar el mensaje. Probá de nuevo en unos
                  minutos.
                </p>
              )}
            </div>
          </motion.form>
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl bg-white/90 px-6 sm:px-8 py-7 shadow-2xl ring-1 ring-slate-200/80 backdrop-blur"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 text-center mb-6">
            Preguntas frecuentes
          </h2>

          <FAQItem
            question="¿Cuánto tarda mi pedido en llegar?"
            answer="Procesamos todas las órdenes dentro de las 24–72 hs hábiles. Luego, el envío demora entre 2 a 5 días hábiles según tu ubicación. Apenas despachemos tu compra, te enviamos un mail con el código de seguimiento."
          />
          <FAQItem
            question="¿Puedo cambiar o devolver un producto?"
            answer="Sí. Aceptamos cambios dentro de los 15 días posteriores a haber recibido tu orden, siempre que el producto esté en perfecto estado, sin uso y con etiquetas. Para iniciar un cambio, podés usar este formulario o escribirnos por mail."
          />
          <FAQItem
            question="¿Qué métodos de pago aceptan?"
            answer="Podés pagar con tarjetas de crédito y débito, Mercado Pago, transferencia bancaria con 20% OFF y efectivo en puntos pick-up seleccionados. Las promos bancarias se aplican automáticamente desde Mercado Pago."
          />
          <FAQItem
            question="¿Qué hago si mi pedido llega con un error?"
            answer="Si tu pedido llega con un producto equivocado o defectuoso, nos hacemos cargo del reemplazo sin costo adicional. Escribinos con el número de orden y algunas fotos del producto para poder resolverlo lo antes posible."
          />
        </motion.div>
      </div>
    </section>
  );
}