"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product } from "@/types/product";
import { useAuth } from "@/lib/auth/AuthContext";

interface FavoritesContextValue {
  favorites: Product[];
  favoriteIds: Set<string>;
  loading: boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = collection(db, "users", user.uid, "favoritos");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const docs = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nombre: data.nombre,
            precio: data.precio,
            tipo: data.tipo,
            coleccion: data.coleccion,
            imagen: data.imagen,
            imagenAlt: data.imagenAlt,
            nuevo: data.nuevo,
            createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
          } as Product;
        });

        setFavorites(docs);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((p) => p.id)),
    [favorites],
  );

  const isFavorite = (productId: string) => favoriteIds.has(productId);

  const toggleFavorite = async (product: Product) => {
    if (!user) return;

    const ref = doc(db, "users", user.uid, "favoritos", product.id);
    if (favoriteIds.has(product.id)) {
      await deleteDoc(ref);
      return;
    }

    await setDoc(ref, {
      nombre: product.nombre,
      precio: product.precio,
      tipo: product.tipo,
      coleccion: product.coleccion,
      imagen: product.imagen,
      imagenAlt: product.imagenAlt ?? "",
      nuevo: !!product.nuevo,
      createdAt: product.createdAt ?? null,
      addedAt: serverTimestamp(),
    });
  };

  const value = useMemo(
    () => ({ favorites, favoriteIds, loading, toggleFavorite, isFavorite }),
    [favorites, favoriteIds, loading],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}

