"use client";

import { FormEvent, useEffect, useState } from "react";
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
import { db } from "@/lib/firebase/config";
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
}

interface CollectionFormState {
  id?: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

const emptyForm: CollectionFormState = {
  nombre: "",
  descripcion: "",
  activa: true,
};

export function AdminCollectionsManager() {
  const [collections, setCollections] = useState<CollectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CollectionFormState>(emptyForm);

  useEffect(() => {
    const q = query(collection(db, "colecciones"), orderBy("nombre", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            nombre: data.nombre,
            slug: data.slug,
            descripcion: data.descripcion,
            activa: data.activa !== false,
          } as CollectionDoc;
        });
        setCollections(docs);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("No se pudieron cargar colecciones");
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const isEditing = !!form.id;

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      slug: slugify(form.nombre.trim()),
      descripcion: form.descripcion.trim(),
      activa: !!form.activa,
      updatedAt: serverTimestamp(),
    };

    try {
      setSaving(true);
      if (form.id) {
        await updateDoc(doc(db, "colecciones", form.id), payload);
        toast.success("Coleccion actualizada");
      } else {
        await addDoc(collection(db, "colecciones"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Coleccion creada");
      }
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error("No se pudo guardar coleccion", {
        description: error?.code || error?.message || "Error desconocido",
      });
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item: CollectionDoc) => {
    setForm({
      id: item.id,
      nombre: item.nombre ?? "",
      descripcion: item.descripcion ?? "",
      activa: item.activa !== false,
    });
  };

  const onDelete = async (item: CollectionDoc) => {
    const confirmDelete = window.confirm(`Eliminar coleccion "${item.nombre}"?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "colecciones", item.id));
      toast.success("Coleccion eliminada");
      if (form.id === item.id) resetForm();
    } catch (error: any) {
      toast.error("No se pudo eliminar", {
        description: error?.code || error?.message || "Error desconocido",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar coleccion" : "Nueva coleccion"}
        </h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
          />
          <Input
            placeholder="Descripcion"
            value={form.descripcion}
            onChange={(e) =>
              setForm((s) => ({ ...s, descripcion: e.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.activa}
              onChange={(e) => setForm((s) => ({ ...s, activa: e.target.checked }))}
            />
            Coleccion activa
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Limpiar
            </Button>
          </div>
        </form>
      </div>

      <div className="xl:col-span-2 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold mb-4">
          Colecciones ({collections.length})
        </h2>
        {loading ? (
          <p className="text-muted-foreground">Cargando colecciones...</p>
        ) : collections.length === 0 ? (
          <p className="text-muted-foreground">No hay colecciones registradas.</p>
        ) : (
          <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
            {collections.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    /{item.slug} | {item.activa ? "Activa" : "Inactiva"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:border-red-600 hover:text-red-600"
                    onClick={() => onDelete(item)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

