import { motion } from "framer-motion";

export default function WhatsAppButton() {
  const whatsappURL =
    "https://wa.me/5493412732527?text=Hola!%20Quiero%20hacer%20una%20consulta";

  return (
    <motion.a
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="
        fixed bottom-6 right-6 z-50
        h-14 w-14 rounded-full 
        bg-[#25D366] shadow-xl
        flex items-center justify-center
      "
      style={{
        boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        className="h-8 w-8"
      />
    </motion.a>
  );
}