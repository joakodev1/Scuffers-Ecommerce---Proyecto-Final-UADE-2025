// src/admin/ProductsList.jsx
import { useEffect, useState } from "react";
import api from "../api/client";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "hoodies", label: "Buzos / Camperas" },
  { value: "pants", label: "Pantalones" },
  { value: "tees", label: "Remeras" },
  { value: "accessories", label: "Accesorios" },
];

const emptyForm = {
  id: null,
  nombre: "",
  slug: "",
  precio: "",
  stock: 0,
  categoria: "hoodies",
  tag: "",
  descripcion: "",
  activo: true,
};

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // imagen principal
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // imagen hover
  const [imageHoverFile, setImageHoverFile] = useState(null);
  const [imageHoverPreview, setImageHoverPreview] = useState(null);

  // imagen galería 1
  const [image3File, setImage3File] = useState(null);
  const [image3Preview, setImage3Preview] = useState(null);

  // imagen galería 2
  const [image4File, setImage4File] = useState(null);
  const [image4Preview, setImage4Preview] = useState(null);

  // ============================
  // Cargar productos
  // ============================
  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await api.get("/admin/products/");
      setProducts(res.data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // ============================
  // Manejo de formulario
  // ============================
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleEdit(product) {
    setForm({
      id: product.id,
      nombre: product.nombre || "",
      slug: product.slug || "",
      precio: product.precio?.toString() || "",
      stock:
        typeof product.stock === "number"
          ? product.stock
          : parseInt(product.stock || 0, 10),
      categoria: product.categoria || "hoodies",
      tag: product.tag || "",
      descripcion: product.descripcion || "",
      activo: product.activo,
    });

    // Reseteamos archivos y cargamos previews desde el backend
    setImageFile(null);
    setImagePreview(product.image_url || product.imagen || null);

    setImageHoverFile(null);
    setImageHoverPreview(
      product.image_hover_url || product.imagen_hover || null
    );

    setImage3File(null);
    setImage3Preview(product.image_3_url || product.imagen_3 || null);

    setImage4File(null);
    setImage4Preview(product.image_4_url || product.imagen_4 || null);

    setError(null);
  }

  function handleNew() {
    setForm(emptyForm);

    setImageFile(null);
    setImagePreview(null);

    setImageHoverFile(null);
    setImageHoverPreview(null);

    setImage3File(null);
    setImage3Preview(null);

    setImage4File(null);
    setImage4Preview(null);

    setError(null);
  }

  // ============================
  // Crear / actualizar producto
  // ============================
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append("nombre", form.nombre);

    if (form.slug && form.slug.trim() !== "") {
      formData.append("slug", form.slug.trim());
    }

    formData.append("precio", parseFloat(form.precio || 0));
    formData.append("stock", parseInt(form.stock || 0, 10));
    formData.append("categoria", form.categoria);

    if (form.tag) formData.append("tag", form.tag);
    if (form.descripcion) formData.append("descripcion", form.descripcion);

    formData.append("activo", form.activo ? "true" : "false");

    // imágenes (coinciden con el modelo: imagen, imagen_hover, imagen_3, imagen_4)
    if (imageFile) {
      formData.append("imagen", imageFile);
    }
    if (imageHoverFile) {
      formData.append("imagen_hover", imageHoverFile);
    }
    if (image3File) {
      formData.append("imagen_3", image3File);
    }
    if (image4File) {
      formData.append("imagen_4", image4File);
    }

    try {
      let res;
      if (form.id) {
        // PATCH para no pisar imágenes si no se mandan
        res = await api.patch(`/admin/products/${form.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setProducts((prev) =>
          prev.map((p) => (p.id === form.id ? res.data : p))
        );
      } else {
        res = await api.post("/admin/products/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProducts((prev) => [res.data, ...prev]);
      }

      // reset
      handleNew();
    } catch (err) {
      console.error("Error guardando producto:", err.response?.data || err);
      setError("No se pudo guardar el producto. Revisá los campos.");
    } finally {
      setSaving(false);
    }
  }

  // ============================
  // Borrar producto
  // ============================
  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      await api.delete(`/admin/products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (form.id === id) {
        handleNew();
      }
    } catch (err) {
      console.error("Error borrando producto:", err.response?.data || err);
      alert("No se pudo eliminar el producto.");
    }
  }

  // ============================
  // Render
  // ============================
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="animate-spin" size={18} />
        Cargando productos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Productos</h1>
          <p className="text-sm text-slate-500">
            Gestioná los productos de la tienda: precios, stock, imágenes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium"
        >
          + Nuevo producto
        </button>
      </header>

      {/* LAYOUT 2 COLUMNAS */}
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        {/* FORMULARIO */}
        <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              {form.id ? "Editar producto" : "Crear producto"}
            </h2>
            {form.id && (
              <button
                type="button"
                onClick={handleNew}
                className="text-xs text-slate-500 underline"
              >
                + Nuevo
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="campera-azul-oversized"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Si lo dejás vacío, el backend puede generarlo automáticamente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Precio
                </label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Categoría
              </label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Tag (opcional)
              </label>
              <input
                type="text"
                name="tag"
                value={form.tag}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="new · drop · sale…"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 resize-none"
                placeholder="Detalles del producto, materiales, fit, etc."
              />
            </div>

            {/* Imágenes del producto */}
            <div className="space-y-3 pt-1 border-t border-slate-100 mt-2">
              <p className="text-sm font-medium text-slate-700">
                Imágenes del producto
              </p>
              <p className="text-xs text-slate-500">
                Podés cargar hasta 4 imágenes: principal, hover y 2 de galería.
              </p>

              {/* Principal */}
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={form.nombre || "Imagen principal"}
                    className="h-16 w-16 rounded-lg object-cover border border-slate-200 bg-slate-50"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                    Sin imagen
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-[11px] text-slate-500 mb-1">
                    Imagen principal
                  </p>
                  <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition">
                    Seleccionar imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setImageFile(null);
                          setImagePreview(null);
                          return;
                        }
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {imageFile
                      ? imageFile.name
                      : "JPG o PNG, peso máximo razonable (ej. 5 MB)."}
                  </p>
                </div>
              </div>

              {/* Hover */}
              <div className="flex items-center gap-3">
                {imageHoverPreview ? (
                  <img
                    src={imageHoverPreview}
                    alt={form.nombre || "Imagen hover"}
                    className="h-16 w-16 rounded-lg object-cover border border-slate-200 bg-slate-50"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                    Sin hover
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-[11px] text-slate-500 mb-1">
                    Imagen hover (al pasar el mouse)
                  </p>
                  <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition">
                    Seleccionar imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setImageHoverFile(null);
                          setImageHoverPreview(null);
                          return;
                        }
                        setImageHoverFile(file);
                        setImageHoverPreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {imageHoverFile
                      ? imageHoverFile.name
                      : "Opcional. Se muestra en el listado al hacer hover."}
                  </p>
                </div>
              </div>

              {/* Galería extra */}
              <div className="grid grid-cols-2 gap-3">
                {/* Imagen 3 */}
                <div className="flex items-center gap-3">
                  {image3Preview ? (
                    <img
                      src={image3Preview}
                      alt={form.nombre || "Imagen galería 1"}
                      className="h-16 w-16 rounded-lg object-cover border border-slate-200 bg-slate-50"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                      Sin img
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Imagen galería 1
                    </p>
                    <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition">
                      Seleccionar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) {
                            setImage3File(null);
                            setImage3Preview(null);
                            return;
                          }
                          setImage3File(file);
                          setImage3Preview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Opcional. Se usa en el detalle.
                    </p>
                  </div>
                </div>

                {/* Imagen 4 */}
                <div className="flex items-center gap-3">
                  {image4Preview ? (
                    <img
                      src={image4Preview}
                      alt={form.nombre || "Imagen galería 2"}
                      className="h-16 w-16 rounded-lg object-cover border border-slate-200 bg-slate-50"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                      Sin img
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Imagen galería 2
                    </p>
                    <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium cursor-pointer hover:bg-slate-800 transition">
                      Seleccionar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) {
                            setImage4File(null);
                            setImage4Preview(null);
                            return;
                          }
                          setImage4File(file);
                          setImage4Preview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Opcional. Se usa en el detalle.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="activo"
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label
                htmlFor="activo"
                className="text-xs text-slate-600 select-none"
              >
                Producto activo (visible en la tienda)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
            >
              {saving
                ? "Guardando..."
                : form.id
                ? "Actualizar producto"
                : "Crear producto"}
            </button>
          </form>
        </section>

        {/* LISTA DE PRODUCTOS */}
        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Productos ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-slate-500">
              Todavía no hay productos cargados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Imagen</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2">Precio</th>
                    <th className="px-3 py-2">Stock</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Activo</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">
                        {p.image_url || p.imagen ? (
                          <img
                            src={p.image_url || p.imagen}
                            alt={p.nombre}
                            className="h-12 w-12 rounded-md object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md border border-dashed border-slate-200 text-[10px] flex items-center justify-center text-slate-400">
                            Sin img
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">
                          {p.nombre}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          slug: {p.slug}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        ${Number(p.precio).toLocaleString("es-AR")}
                      </td>
                      <td className="px-3 py-2">{p.stock}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {p.categoria}
                      </td>
                      <td className="px-3 py-2">
                        {p.activo ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            Oculto
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-[11px] font-medium text-slate-700 underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-[11px] font-medium text-red-600 underline"
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}