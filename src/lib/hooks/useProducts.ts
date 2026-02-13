// src/lib/hooks/useProducts.ts (VERSIÓN CON PAGINACIÓN)

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
      let q = query(collection(db, "productos"));

      if (filters?.tipo) {
        q = query(q, where("tipo", "==", filters.tipo));
      }

      if (filters?.coleccion) {
        q = query(q, where("coleccion", "==", filters.coleccion));
      }

      switch (sortBy) {
        case "price-asc":
          q = query(q, orderBy("precio", "asc"));
          break;
        case "price-desc":
          q = query(q, orderBy("precio", "desc"));
          break;
        case "name-asc":
          q = query(q, orderBy("nombre", "asc"));
          break;
        case "name-desc":
          q = query(q, orderBy("nombre", "desc"));
          break;
        default:
          q = query(q, orderBy("nombre", "asc"));
      }

      if (pageParam) {
        q = query(q, startAfter(pageParam));
      }

      q = query(q, limit(pageSize));

      const snapshot = await getDocs(q);

      const products: Product[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            nombre: doc.data().nombre,
            precio: doc.data().precio,
            tipo: doc.data().tipo,
            coleccion: doc.data().coleccion,
            imagen: doc.data().imagen,
            imagenAlt: doc.data().imagenAlt,
          }) as Product,
      );

      return {
        products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
        hasMore: snapshot.docs.length === pageSize,
      };
    },

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },

    staleTime: 1000 * 60 * 5,
  });
};

// ==========================================
// Obtener un producto por ID
// ==========================================
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const docRef = doc(db, "productos", productId);
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
// Obtener productos por tipo
// ==========================================
export const useProductsByTipo = (tipo: string, limitCount: number = 8) => {
  return useQuery({
    queryKey: ["products-by-tipo", tipo, limitCount],
    queryFn: async () => {
      const q = query(
        collection(db, "productos"),
        where("tipo", "==", tipo),
        orderBy("nombre", "asc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
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
        collection(db, "productos"),
        where("coleccion", "==", coleccion),
        orderBy("nombre", "asc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
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
        collection(db, "productos"),
        where("tipo", "==", tipo),
        orderBy("nombre", "asc"),
        limit(limitCount + 1),
      );

      const snapshot = await getDocs(q);

      return snapshot.docs
        .filter((doc) => doc.id !== currentProductId)
        .slice(0, limitCount)
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
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
// Buscar productos
// ==========================================
export const useSearchProducts = (searchQuery: string) => {
  return useQuery({
    queryKey: ["search-products", searchQuery],
    queryFn: async () => {
      const q = query(collection(db, "productos"));
      const snapshot = await getDocs(q);

      const searchLower = searchQuery.toLowerCase();

      return snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
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
// Obtener tipos únicos
// ==========================================
export const useProductTypes = () => {
  return useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "productos"));
      const types = new Set<string>();

      snapshot.docs.forEach((doc) => {
        const tipo = doc.data().tipo;
        if (tipo) types.add(tipo);
      });

      return Array.from(types).sort();
    },
    staleTime: 1000 * 60 * 10,
  });
};

// ==========================================
// Obtener colecciones únicas
// ==========================================
export const useColecciones = () => {
  return useQuery({
    queryKey: ["colecciones"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "productos"));
      const colecciones = new Set<string>();

      snapshot.docs.forEach((doc) => {
        const coleccion = doc.data().coleccion;
        if (coleccion) colecciones.add(coleccion);
      });

      return Array.from(colecciones).sort();
    },
    staleTime: 1000 * 60 * 10,
  });
};
