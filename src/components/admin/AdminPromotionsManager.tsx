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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type PromoStatus = "draft" | "ready" | "sent";

interface PromotionDoc {
  id: string;
  titulo: string;
  descripcion: string;
  descuento: number;
  productIds: string[];
  status: PromoStatus;
}

interface PromotionFormState {
  titulo: string;
  descripcion: string;
  descuento: string;
  productIdsText: string;
}

const emptyForm: PromotionFormState = {
  titulo: "",
  descripcion: "",
  descuento: "10",
  productIdsText: "",
};

export function AdminPromotionsManager() {
  const [promotions, setPromotions] = useState<PromotionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PromotionFormState>(emptyForm);

  useEffect(() => {
    const q = query(collection(db, "promociones"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            titulo: data.titulo ?? "",
            descripcion: data.descripcion ?? "",
            descuento: data.descuento ?? 0,
            productIds: Array.isArray(data.productIds) ? data.productIds : [],
            status: (data.status as PromoStatus) ?? "draft",
          };
        });
        setPromotions(docs);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("No se pudieron cargar promociones");
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      toast.error("El titulo es obligatorio");
      return;
    }

    const descuento = Number(form.descuento);
    if (Number.isNaN(descuento) || descuento < 0 || descuento > 100) {
      toast.error("Descuento invalido (0-100)");
      return;
    }

    const productIds = form.productIdsText
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      await addDoc(collection(db, "promociones"), {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        descuento,
        productIds,
        status: "draft",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Promocion creada");
      setForm(emptyForm);
    } catch (error: any) {
      console.error(error);
      toast.error("No se pudo crear promocion", {
        description: error?.code || error?.message || "Error desconocido",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: PromoStatus) => {
    try {
      await updateDoc(doc(db, "promociones", id), {
        status,
        updatedAt: serverTimestamp(),
      });
      toast.success("Estado actualizado");
    } catch (error: any) {
      toast.error("No se pudo actualizar estado", {
        description: error?.code || error?.message || "Error desconocido",
      });
    }
  };

  const removePromo = async (id: string) => {
    const ok = window.confirm("Eliminar esta promocion?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "promociones", id));
      toast.success("Promocion eliminada");
    } catch (error: any) {
      toast.error("No se pudo eliminar", {
        description: error?.code || error?.message || "Error desconocido",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold mb-4">Nueva promocion</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            placeholder="Titulo"
            value={form.titulo}
            onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))}
          />
          <Input
            placeholder="Descripcion corta"
            value={form.descripcion}
            onChange={(e) =>
              setForm((s) => ({ ...s, descripcion: e.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Descuento %"
            value={form.descuento}
            onChange={(e) =>
              setForm((s) => ({ ...s, descuento: e.target.value }))
            }
          />
          <Input
            placeholder="IDs de productos separados por coma"
            value={form.productIdsText}
            onChange={(e) =>
              setForm((s) => ({ ...s, productIdsText: e.target.value }))
            }
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Guardando..." : "Crear promocion"}
          </Button>
        </form>
      </div>

      <div className="xl:col-span-2 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold mb-4">
          Promociones ({promotions.length})
        </h2>

        {loading ? (
          <p className="text-muted-foreground">Cargando promociones...</p>
        ) : promotions.length === 0 ? (
          <p className="text-muted-foreground">No hay promociones creadas.</p>
        ) : (
          <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
            {promotions.map((promo) => (
              <div key={promo.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{promo.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      Dcto {promo.descuento}% | Productos: {promo.productIds.length}{" "}
                      | Estado: {promo.status}
                    </p>
                    {promo.descripcion && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {promo.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(promo.id, "ready")}
                    >
                      Ready
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(promo.id, "sent")}
                    >
                      Sent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:border-red-600 hover:text-red-600"
                      onClick={() => removePromo(promo.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

