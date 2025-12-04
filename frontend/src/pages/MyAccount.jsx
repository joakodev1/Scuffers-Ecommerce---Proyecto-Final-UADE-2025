// src/pages/MyAccount.jsx
import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client"; 

export default function MyAccount() {
  const { user } = useAuth();

  const displayName =
    user?.first_name || user?.username || user?.email || "Invitado";

  const email = user?.email || "sin-email@scuffers.com";

  // ----- Dirección de envío (modelo Cliente) -----
  const [address, setAddress] = useState({
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    telefono: "",
  });

  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadAddress() {
      try {
        const res = await api.get("/me/address/");
        setAddress({
          direccion: res.data.direccion || "",
          ciudad: res.data.ciudad || "",
          provincia: res.data.provincia || "",
          codigo_postal: res.data.codigo_postal || "",
          telefono: res.data.telefono || "",
        });
      } catch (err) {
        console.error("Error cargando dirección:", err.response?.data || err);
      }
    }

    loadAddress();
  }, [user]);

  function handleAddressChange(e) {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddressSubmit(e) {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMessage("");

    try {
      await api.patch("/me/address/", address);
      setAddressMessage("Dirección guardada correctamente ✔");
    } catch (err) {
      console.error("Error guardando dirección:", err.response?.data || err);
      setAddressMessage("No se pudo guardar la dirección.");
    } finally {
      setSavingAddress(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 px-4 pb-16">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="border-b pb-4">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
            Mi cuenta
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Hola, {displayName}.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Desde acá podés ver tus datos, revisar tus pedidos y seguir
            comprando en Scuffers.
          </p>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Columna izquierda: info + dirección */}
          <div className="md:col-span-2 space-y-6">
            {/* Datos de la cuenta */}
            <section className="bg-white rounded-2xl shadow-sm p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Información de la cuenta
              </h2>
              <div className="space-y-2 text-sm text-slate-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Nombre
                  </p>
                  <p className="mt-0.5">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <p className="mt-0.5">{email}</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                En próximas versiones vas a poder editar también tus datos
                personales desde acá.
              </p>
            </section>

            {/* Dirección de envío (Cliente) */}
            <section className="bg-white rounded-2xl shadow-sm p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Dirección de envío
              </h2>
              <p className="text-xs text-slate-500 mb-1">
                Guardá tu dirección principal para no tener que completarla en
                cada compra.
              </p>

              <form
                onSubmit={handleAddressSubmit}
                className="space-y-3 text-sm text-slate-700"
              >
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400">
                    Calle y número
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={address.direccion}
                    onChange={handleAddressChange}
                    className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Ej. Av. Siempreviva 742"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={address.ciudad}
                      onChange={handleAddressChange}
                      className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Ej. Córdoba"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400">
                      Provincia
                    </label>
                    <input
                      type="text"
                      name="provincia"
                      value={address.provincia}
                      onChange={handleAddressChange}
                      className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Ej. Córdoba"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400">
                      Código postal
                    </label>
                    <input
                      type="text"
                      name="codigo_postal"
                      value={address.codigo_postal}
                      onChange={handleAddressChange}
                      className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Ej. 5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400">
                    Teléfono de contacto
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={address.telefono}
                    onChange={handleAddressChange}
                    className="mt-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Ej. +54 9 351 1234567"
                  />
                </div>

                {addressMessage && (
                  <p className="text-xs mt-1 text-slate-500">
                    {addressMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-xs font-medium px-4 py-2 disabled:opacity-60"
                >
                  {savingAddress ? "Guardando..." : "Guardar dirección"}
                </button>
              </form>
            </section>
          </div>

          {/* Accesos rápidos */}
          <section className="bg-white rounded-2xl shadow-sm p-4 md:p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Accesos rápidos
            </h2>

            <div className="space-y-3 text-sm">
              <Link
                to="/my-orders"
                className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-medium text-slate-900">Mis pedidos</p>
                  <p className="text-xs text-slate-500">
                    Mirá el historial de tus compras y su estado.
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-slate-500">
                  Ver
                </span>
              </Link>

              <Link
                to="/cart"
                className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-medium text-slate-900">Mi carrito</p>
                  <p className="text-xs text-slate-500">
                    Retomá tu compra donde la dejaste.
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-slate-500">
                  Ir
                </span>
              </Link>

              <Link
                to="/shop"
                className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-medium text-slate-900">Seguir comprando</p>
                  <p className="text-xs text-slate-500">
                    Explorá todos los productos de la tienda.
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-slate-500">
                  Shop
                </span>
              </Link>

              {/* Link al dashboard admin, sólo si es staff */}
              {user?.is_staff && (
                <Link
                  to="/admin"
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100 transition"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      Dashboard Admin
                    </p>
                    <p className="text-xs text-slate-500">
                      Accedé al panel administrativo.
                    </p>
                  </div>
                  <span className="text-[11px] uppercase tracking-wide text-amber-700">
                    Ir
                  </span>
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}