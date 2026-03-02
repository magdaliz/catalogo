// src/lib/hooks/useProducts.ts

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Query,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product, ProductFilters, SortOption } from "@/types/product";

// ==========================================
// Hook principal con PAGINACIÓN INFINITA
// ==========================================
export const useProducts = (
  filters?: ProductFilters,
  sortBy: SortOption = "newest",
  pageSize: number = 12,
) => {
  return useInfiniteQuery({
    queryKey: ["products-infinite", filters, sortBy, pageSize],
    initialPageParam: null as DocumentSnapshot | null,

    queryFn: async ({ pageParam }) => {
      try {
        let q: Query = collection(db, "productos");

        // Filtro por tipo
        if (filters?.tipo) q = query(q, where("tipo", "==", filters.tipo));

        // Filtro por colección
        if (filters?.coleccion)
          q = query(q, where("coleccion", "==", filters.coleccion));
        if (filters?.nuevo) q = query(q, where("nuevo", "==", true));

        const hasMinPrice =
          filters?.minPrecio !== undefined && filters.minPrecio > 0;
        const hasMaxPrice =
          filters?.maxPrecio !== undefined && filters.maxPrecio < 500000;
        const hasPriceFilter = hasMinPrice || hasMaxPrice;

        if (hasMinPrice)
          q = query(q, where("precio", ">=", filters!.minPrecio!));
        if (hasMaxPrice)
          q = query(q, where("precio", "<=", filters!.maxPrecio!));

        // Ordenamiento
        if (hasPriceFilter) {
          q = query(q, orderBy("precio", "asc"));
          q = query(q, orderBy("nombre", "asc")); // (esto puede pedir índice, pero si falla lo veremos)
        } else {
          q = query(q, orderBy("nombre", "asc"));
        }

        if (pageParam) q = query(q, startAfter(pageParam));
        q = query(q, limit(pageSize));

        // Timeout para detectar “se quedó colgado”
        const snap = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("getDocs timeout (10s)")), 10000),
          ),
        ]);

        const products: Product[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            nombre: d.nombre,
            precio: d.precio,
            tipo: d.tipo,
            coleccion: d.coleccion,
            nuevo: d.nuevo,
            createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
            imagen: d.imagen,
            imagenAlt: d.imagenAlt,
          } as Product;
        });

        return {
          products,
          lastDoc: snap.docs[snap.docs.length - 1] ?? null,
          hasMore: snap.docs.length === pageSize,
        };
      } catch (e: any) {
        console.error("QUERY FAILED:", {
          name: e?.name,
          code: e?.code,
          message: e?.message ?? String(e),
        });
        throw e;
      }
    },
    retry: false,

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },

    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// ==========================================
// Obtener un producto por ID
// ==========================================
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const docRef = doc(db, "productos", productId); // ← CORREGIDO
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Producto no encontrado");
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        nombre: data.nombre,
        precio: data.precio,
        tipo: data.tipo,
        coleccion: data.coleccion,
        imagen: data.imagen,
        imagenAlt: data.imagenAlt,
      } as Product;
    },
    enabled: !!productId,
  });
};

// ==========================================
// Obtener productos por tipo (categoría)
// ==========================================
export const useProductsByTipo = (tipo: string, limitCount: number = 8) => {
  return useQuery({
    queryKey: ["products-by-tipo", tipo, limitCount],
    queryFn: async () => {
      const q = query(
        collection(db, "productos"), // ← CORREGIDO
        where("tipo", "==", tipo),
        orderBy("nombre", "asc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          nombre: data.nombre,
          precio: data.precio,
          tipo: data.tipo,
          coleccion: data.coleccion,
          imagen: data.imagen,
          imagenAlt: data.imagenAlt,
        } as Product;
      });
    },
    enabled: !!tipo,
  });
};

// ==========================================
// Obtener productos por colección
// ==========================================
export const useProductsByColeccion = (
  coleccion: string,
  limitCount: number = 8,
) => {
  return useQuery({
    queryKey: ["products-by-coleccion", coleccion, limitCount],
    queryFn: async () => {
      const q = query(
        collection(db, "productos"), // ← CORREGIDO
        where("coleccion", "==", coleccion),
        orderBy("nombre", "asc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          nombre: data.nombre,
          precio: data.precio,
          tipo: data.tipo,
          coleccion: data.coleccion,
          imagen: data.imagen,
          imagenAlt: data.imagenAlt,
        } as Product;
      });
    },
    enabled: !!coleccion,
  });
};

// ==========================================
// Obtener productos relacionados
// ==========================================
export const useRelatedProducts = (
  tipo: string,
  currentProductId: string,
  limitCount: number = 4,
) => {
  return useQuery({
    queryKey: ["related-products", tipo, currentProductId],
    queryFn: async () => {
      const q = query(
        collection(db, "productos"), // ← CORREGIDO
        where("tipo", "==", tipo),
        orderBy("nombre", "asc"),
        limit(limitCount + 1),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .filter((docSnap) => docSnap.id !== currentProductId)
        .slice(0, limitCount)
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            nombre: data.nombre,
            precio: data.precio,
            tipo: data.tipo,
            coleccion: data.coleccion,
            imagen: data.imagen,
            imagenAlt: data.imagenAlt,
          } as Product;
        });
    },
    enabled: !!tipo && !!currentProductId,
  });
};

// ==========================================
// Buscar productos por nombre
// ==========================================
export const useSearchProducts = (searchQuery: string) => {
  return useQuery({
    queryKey: ["search-products", searchQuery],
    queryFn: async () => {
      const q = query(collection(db, "productos")); // ← CORREGIDO
      const snapshot = await getDocs(q);

      const searchLower = searchQuery.toLowerCase();
      return snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            nombre: data.nombre,
            precio: data.precio,
            tipo: data.tipo,
            coleccion: data.coleccion,
            imagen: data.imagen,
            imagenAlt: data.imagenAlt,
          } as Product;
        })
        .filter(
          (product) =>
            product.nombre.toLowerCase().includes(searchLower) ||
            product.tipo.toLowerCase().includes(searchLower) ||
            product.coleccion.toLowerCase().includes(searchLower),
        );
    },
    enabled: searchQuery.length > 0,
    staleTime: 1000 * 60 * 2,
  });
};

// ==========================================
// Obtener todos los tipos únicos (SIN DUPLICADOS)
// ==========================================
export const useProductTypes = () => {
  return useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "productos")); // ← CORREGIDO
      const types = new Set<string>();

      snapshot.docs.forEach((docSnap) => {
        const tipo = docSnap.data().tipo;
        if (tipo) types.add(tipo); // Set elimina duplicados automáticamente
      });

      return Array.from(types).sort(); // Ordenar alfabéticamente
    },
    staleTime: 1000 * 60 * 10,
  });
};

// ==========================================
// Obtener todas las colecciones únicas
// ==========================================
export const useColecciones = () => {
  return useQuery({
    queryKey: ["colecciones"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "productos")); // ← CORREGIDO
      const colecciones = new Set<string>();

      snapshot.docs.forEach((docSnap) => {
        const coleccion = docSnap.data().coleccion;
        if (coleccion) colecciones.add(coleccion);
      });

      return Array.from(colecciones).sort();
    },
    staleTime: 1000 * 60 * 10,
  });
};
