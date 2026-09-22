"use client";

import { FormEvent, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { slugify } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CollectionDoc {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  activa?: boolean;
  imagen?: string;
  imagenStoragePath?: string;
}

interface CollectionFormState {
  id?: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
  imagen?: string;
  imagenStoragePath?: string;
  nombreOriginal?: string;
}

const emptyForm: CollectionFormState = { nombre: "", descripcion: "", activa: true };

const getErrorDescription = (error: unknown) =>
  error instanceof Error ? error.message : "Error desconocido";

export function AdminCollectionsManager() {
  const [collections, setCollections] = useState<CollectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState<CollectionFormState>(emptyForm);

  useEffect(() => {
    const q = query(collection(db, "colecciones"), orderBy("nombre", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setCollections(snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return { id: docSnap.id, nombre: data.nombre, slug: data.slug, descripcion: data.descripcion, activa: data.activa !== false, imagen: data.imagen, imagenStoragePath: data.imagenStoragePath } as CollectionDoc;
      }));
      setLoading(false);
    }, (error) => {
      console.error(error);
      toast.error("No se pudieron cargar colecciones");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadCollectionImage = async (file: File, collectionId: string) => {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `colecciones/${collectionId}/${Date.now()}-${safeFileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return { imagen: await getDownloadURL(storageRef), imagenStoragePath: path };
  };

  const syncProductCollectionName = async (oldName: string, newName: string) => {
    const productsSnapshot = await getDocs(
      query(collection(db, "productos"), where("coleccion", "==", oldName)),
    );

    for (let index = 0; index < productsSnapshot.docs.length; index += 450) {
      const batch = writeBatch(db);
      productsSnapshot.docs.slice(index, index + 450).forEach((productDoc) => {
        batch.update(productDoc.ref, { coleccion: newName, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    }

    return productsSnapshot.size;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return toast.error("El nombre es obligatorio");
    if (!form.id && !imageFile) return toast.error("La imagen es obligatoria para una nueva coleccion");

    const payload = { nombre: form.nombre.trim(), slug: slugify(form.nombre.trim()), descripcion: form.descripcion.trim(), activa: !!form.activa, updatedAt: serverTimestamp() };
    let createdCollectionId: string | undefined;
    try {
      setSaving(true);
      if (form.id) {
        let imagePayload = {};
        if (imageFile) {
          setUploadingImage(true);
          imagePayload = await uploadCollectionImage(imageFile, form.id);
        }
        await updateDoc(doc(db, "colecciones", form.id), { ...payload, ...imagePayload });
        if (imageFile && form.imagenStoragePath) {
          try {
            await deleteObject(ref(storage, form.imagenStoragePath));
          } catch (error) {
            console.error(error);
            toast.warning("Coleccion actualizada, pero imagen anterior no se pudo borrar");
          }
        }
        if (form.nombreOriginal && form.nombreOriginal !== payload.nombre) {
          try {
            const productCount = await syncProductCollectionName(form.nombreOriginal, payload.nombre);
            toast.success(`Coleccion actualizada. ${productCount} productos actualizados.`);
          } catch (error) {
            console.error(error);
            toast.warning("Coleccion actualizada, pero no se pudieron actualizar sus productos");
          }
        } else {
          toast.success("Coleccion actualizada");
        }
      } else {
        const collectionRef = await addDoc(collection(db, "colecciones"), { ...payload, createdAt: serverTimestamp() });
        createdCollectionId = collectionRef.id;
        setUploadingImage(true);
        await updateDoc(collectionRef, await uploadCollectionImage(imageFile!, collectionRef.id));
        toast.success("Coleccion creada");
      }
      resetForm();
    } catch (error: unknown) {
      if (createdCollectionId) {
        try {
          await deleteDoc(doc(db, "colecciones", createdCollectionId));
        } catch (cleanupError) {
          console.error(cleanupError);
        }
      }
      console.error(error);
      toast.error("No se pudo guardar coleccion", { description: getErrorDescription(error) });
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const onEdit = (item: CollectionDoc) => {
    setForm({ id: item.id, nombre: item.nombre ?? "", nombreOriginal: item.nombre ?? "", descripcion: item.descripcion ?? "", activa: item.activa !== false, imagen: item.imagen, imagenStoragePath: item.imagenStoragePath });
    setImageFile(null);
    setImagePreview(item.imagen ?? "");
  };

  const onDelete = async (item: CollectionDoc) => {
    if (!window.confirm(`Eliminar coleccion "${item.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "colecciones", item.id));
      if (item.imagenStoragePath) {
        try {
          await deleteObject(ref(storage, item.imagenStoragePath));
        } catch (error) {
          console.error(error);
          toast.warning("Coleccion eliminada, pero imagen no se pudo borrar");
        }
      }
      toast.success("Coleccion eliminada");
      if (form.id === item.id) resetForm();
    } catch (error: unknown) {
      toast.error("No se pudo eliminar", { description: getErrorDescription(error) });
    }
  };

  const isEditing = !!form.id;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? "Editar coleccion" : "Nueva coleccion"}</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5"><label className="text-sm font-medium">Nombre de la coleccion</label><Input placeholder="Ej: Amor y Amistad" value={form.nombre} onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Descripcion</label><textarea className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" placeholder="Describe la coleccion como un parrafo corto" value={form.descripcion} onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))} /></div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Imagen de la coleccion</label>
            <Input type="file" accept="image/*" disabled={saving || uploadingImage} onChange={(e) => handleImageChange(e.target.files?.[0])} />
            {imagePreview && <div className="rounded-lg border overflow-hidden bg-muted">{/* eslint-disable-next-line @next/next/no-img-element -- local file preview before upload */}<img src={imagePreview} alt={form.nombre || "Vista previa de coleccion"} className="w-full h-40 object-contain" /></div>}
            <p className="text-xs text-muted-foreground">{isEditing ? "Selecciona imagen para reemplazar actual." : "Obligatoria para crear coleccion."}</p>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.activa} onChange={(e) => setForm((s) => ({ ...s, activa: e.target.checked }))} />Coleccion activa</label>
          <div className="flex gap-2 pt-2"><Button type="submit" className="flex-1" disabled={saving || uploadingImage}>{saving || uploadingImage ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}</Button><Button type="button" variant="outline" onClick={resetForm} disabled={saving}>Limpiar</Button></div>
        </form>
      </div>
      <div className="xl:col-span-2 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold mb-4">Colecciones ({collections.length})</h2>
        {loading ? <p className="text-muted-foreground">Cargando colecciones...</p> : collections.length === 0 ? <p className="text-muted-foreground">No hay colecciones registradas.</p> : <div className="space-y-2 max-h-[560px] overflow-auto pr-1">{collections.map((item) => <div key={item.id} className="rounded-lg border p-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-medium truncate">{item.nombre}</p><p className="text-xs text-muted-foreground truncate">/{item.slug} | {item.activa ? "Activa" : "Inactiva"}</p></div><div className="flex gap-2 shrink-0"><Button variant="outline" size="sm" onClick={() => onEdit(item)}>Editar</Button><Button variant="outline" size="sm" className="hover:border-red-600 hover:text-red-600" onClick={() => onDelete(item)}>Eliminar</Button></div></div>)}</div>}
      </div>
    </div>
  );
}
