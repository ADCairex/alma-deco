import { useEffect, useRef, useState } from "react";
import type { Product } from "../../types/product";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  uploadProductImages,
} from "../../api/adminClient";
import { resolveImageUrl } from "../../utils/imageUrl";

const EMPTY_FORM = {
  id: "",
  name: "",
  price: 0,
  currency: "EUR",
  image_url: "",
  images: [] as string[],
  description: "",
  category: "",
  stock: 0,
};

type FormState = typeof EMPTY_FORM;

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadProducts() {
    setLoading(true);
    getAdminProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setUploadError("");
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image_url: product.image_url,
      images: product.images?.length ? product.images : [product.image_url],
      description: product.description,
      category: product.category,
      stock: product.stock,
    });
    setFormError("");
    setUploadError("");
    setShowModal(true);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteAdminProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (e: unknown) {
      alert(`Error al eliminar: ${(e as Error).message}`);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await uploadProductImages(files);
      setForm((prev) => {
        const merged = [...prev.images, ...urls];
        return { ...prev, images: merged, image_url: merged[0] };
      });
    } catch (err: unknown) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setForm((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: next, image_url: next[0] ?? "" };
    });
  }

  function moveImage(from: number, to: number) {
    setForm((prev) => {
      const next = [...prev.images];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...prev, images: next, image_url: next[0] };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.images.length === 0) {
      setFormError("Añade al menos una imagen al producto.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      const payload = { ...form, image_url: form.images[0] };
      if (editing) {
        const updated = await updateAdminProduct(editing.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      } else {
        const created = await createAdminProduct(payload);
        setProducts((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (e: unknown) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  }

  if (loading) return <div className="p-8 text-stone-500">Cargando productos...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-stone-800">Productos</h2>
        <button
          onClick={openCreate}
          className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-6 py-3">Producto</th>
              <th className="text-left px-6 py-3">Categoría</th>
              <th className="text-right px-6 py-3">Precio</th>
              <th className="text-right px-6 py-3">Stock</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img
                        src={resolveImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                      />
                      {product.images?.length > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-stone-700 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                          {product.images.length}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{product.name}</p>
                      <p className="text-xs text-stone-400">{product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-stone-600">{product.category}</td>
                <td className="px-6 py-3 text-right font-medium text-stone-800">
                  {product.price.toFixed(2)} {product.currency}
                </td>
                <td className="px-6 py-3 text-right">
                  <span
                    className={`font-medium ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock <= 3
                        ? "text-amber-600"
                        : "text-stone-700"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-serif text-lg text-stone-800">
                {editing ? "Editar producto" : "Nuevo producto"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editing && (
                <Field label="ID del producto" name="id" value={form.id} onChange={handleChange} required placeholder="prod-011" />
              )}
              <Field label="Nombre" name="name" value={form.name} onChange={handleChange} required placeholder="Nombre del producto" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio (€)" name="price" value={String(form.price)} onChange={handleChange} required type="number" step="0.01" min="0" />
                <Field label="Stock" name="stock" value={String(form.stock)} onChange={handleChange} required type="number" min="0" />
              </div>
              <Field label="Categoría" name="category" value={form.category} onChange={handleChange} required placeholder="Jarrones" />

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Imágenes del producto
                  <span className="ml-1 text-xs font-normal text-stone-400">(la primera es la principal)</span>
                </label>

                {/* Zona de drop / botón */}
                <div
                  className="border-2 border-dashed border-stone-200 rounded-lg p-4 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dt = e.dataTransfer;
                    const input = fileInputRef.current;
                    if (input && dt.files.length) {
                      // Simular selección de archivos
                      const event = { target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileChange(event);
                    }
                  }}
                >
                  {uploading ? (
                    <p className="text-sm text-stone-500">Subiendo...</p>
                  ) : (
                    <>
                      <p className="text-sm text-stone-500">Arrastra fotos aquí o</p>
                      <p className="text-sm font-medium text-stone-700 mt-0.5">haz clic para seleccionar</p>
                      <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP — máx. 10 MB por archivo</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadError && (
                  <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                )}

                {/* Previews */}
                {form.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {form.images.map((url, i) => (
                      <div key={url + i} className="relative group">
                        <img
                          src={resolveImageUrl(url)}
                          alt={`Imagen ${i + 1}`}
                          className={`w-full aspect-square object-cover rounded-lg ${
                            i === 0 ? "ring-2 ring-stone-800" : "ring-1 ring-stone-200"
                          }`}
                        />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-stone-800 text-white text-[10px] px-1 rounded">
                            Principal
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(i, i - 1)}
                              className="text-white bg-black/40 rounded p-0.5 text-xs hover:bg-black/70"
                              title="Mover izquierda"
                            >
                              ←
                            </button>
                          )}
                          {i < form.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(i, i + 1)}
                              className="text-white bg-black/40 rounded p-0.5 text-xs hover:bg-black/70"
                              title="Mover derecha"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="text-white bg-red-500/80 rounded p-0.5 text-xs hover:bg-red-600"
                            title="Eliminar imagen"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              {formError && (
                <p className="text-red-600 text-sm">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  step,
  min,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
    </div>
  );
}
