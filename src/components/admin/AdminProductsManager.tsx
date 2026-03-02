"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductFormState {
  id?: string;
  nombre: string;
  precio: string;
  tipo: string;
  coleccion: string;
  imagen: string;
  descuento: string;
  nuevo: boolean;
}

const emptyForm: ProductFormState = {
  nombre: "",
  precio: "",
  tipo: "",
  coleccion: "",
  imagen: "",
  descuento: "0",
  nuevo: false,
};

export function AdminProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const q = query(collection(db, "productos"), orderBy("nombre", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            nombre: data.nombre,
            precio: data.precio,
            descuento: data.descuento ?? 0,
            tipo: data.tipo,
            coleccion: data.coleccion,
            imagen: data.imagen,
            imagenAlt: data.imagenAlt,
            nuevo: !!data.nuevo,
            createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
          } as Product;
        });
        setProducts(docs);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("No se pudieron cargar productos");
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const isEditing = !!form.id;
  const title = isEditing ? "Editar producto" : "Nuevo producto";

  const resetForm = () => setForm(emptyForm);

  const handleImageUpload = async (file?: File) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `productos/${Date.now()}-${safeFileName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setForm((s) => ({
        ...s,
        imagen: url,
      }));

      toast.success("Imagen cargada correctamente");
    } catch (error: any) {
      console.error(error);
      toast.error("No se pudo subir la imagen", {
        description: error?.code || error?.message || "Error desconocido",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio.trim()) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }

    const precio = Number(form.precio);
    const descuento = Number(form.descuento || "0");
    if (Number.isNaN(precio) || precio <= 0) {
      toast.error("Precio invalido");
      return;
    }
    if (Number.isNaN(descuento) || descuento < 0 || descuento > 100) {
      toast.error("Descuento invalido (0-100)");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      precio,
      descuento,
      tipo: form.tipo.trim() || "general",
      coleccion: form.coleccion.trim() || "General",
      imagen: form.imagen.trim() || "/images/placeholder.jpg",
      imagenAlt: form.nombre.trim(),
      nuevo: !!form.nuevo,
      updatedAt: serverTimestamp(),
    };

    try {
      setSaving(true);
      if (form.id) {
        await updateDoc(doc(db, "productos", form.id), payload);
        toast.success("Producto actualizado");
      } else {
        await addDoc(collection(db, "productos"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Producto creado");
      }
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error("No se pudo guardar producto", {
        description: error?.code || error?.message || "Error desconocido",
      });
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (product: Product) => {
    setForm({
      id: product.id,
      nombre: product.nombre ?? "",
      precio: String(product.precio ?? ""),
      tipo: product.tipo ?? "",
      coleccion: product.coleccion ?? "",
      imagen: product.imagen ?? "",
      descuento: String(product.descuento ?? 0),
      nuevo: !!product.nuevo,
    });
  };

  const onDelete = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Eliminar producto "${product.nombre}"?`,
    );
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "productos", product.id));
      toast.success("Producto eliminado");
      if (form.id === product.id) resetForm();
    } catch (error: any) {
      toast.error("No se pudo eliminar", {
        description: error?.code || error?.message || "Error desconocido",
      });
    }
  };

  const totalWithDiscount = useMemo(
    () => products.filter((p) => (p.descuento ?? 0) > 0).length,
    [products],
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              placeholder="Ej: Aretes Corazon"
              value={form.nombre}
              onChange={(e) =>
                setForm((s) => ({ ...s, nombre: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Precio</label>
            <Input
              placeholder="Ej: 35000"
              type="number"
              value={form.precio}
              onChange={(e) =>
                setForm((s) => ({ ...s, precio: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descuento (%)</label>
            <Input
              placeholder="Ej: 10"
              type="number"
              value={form.descuento}
              onChange={(e) =>
                setForm((s) => ({ ...s, descuento: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Input
              placeholder="Ej: aretes"
              value={form.tipo}
              onChange={(e) => setForm((s) => ({ ...s, tipo: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Coleccion</label>
            <Input
              placeholder="Ej: Navidad"
              value={form.coleccion}
              onChange={(e) =>
                setForm((s) => ({ ...s, coleccion: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Imagen del producto</label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
            />
            {uploadingImage && (
              <p className="text-xs text-muted-foreground">Subiendo imagen...</p>
            )}
            {form.imagen && (
              <div className="rounded-lg border overflow-hidden bg-muted">
                <img
                  src={form.imagen}
                  alt={form.nombre || "Preview"}
                  className="w-full h-40 object-contain"
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.nuevo}
              onChange={(e) => setForm((s) => ({ ...s, nuevo: e.target.checked }))}
            />
            Marcar como nuevo
          </label>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={saving || uploadingImage}
            >
              {saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={saving}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </div>

      <div className="xl:col-span-2 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Productos ({products.length})</h2>
          <p className="text-sm text-muted-foreground">
            Con descuento: {totalWithDiscount}
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">No hay productos registrados.</p>
        ) : (
          <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{product.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {product.tipo} | {product.coleccion} | $
                    {product.precio.toLocaleString("es-CO")}
                    {(product.descuento ?? 0) > 0
                      ? ` | dcto ${product.descuento}%`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewProduct(product)}
                    title="Vista previa"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:border-red-600 hover:text-red-600"
                    onClick={() => onDelete(product)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!previewProduct}
        onOpenChange={(open) => {
          if (!open) setPreviewProduct(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          {previewProduct && (
            <div className="space-y-3">
              <p className="font-medium">{previewProduct.nombre}</p>
              <div className="rounded-lg border overflow-hidden bg-muted">
                <img
                  src={previewProduct.imagen || "/images/placeholder.jpg"}
                  alt={previewProduct.imagenAlt || previewProduct.nombre}
                  className="w-full h-auto object-contain max-h-96"
                />
              </div>
              <p className="text-xs text-muted-foreground break-all">
                {previewProduct.imagen}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
