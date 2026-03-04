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
// Hook principal con PAGINACIÃ“N INFINITA
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
        const hasSearchFilter = !!filters?.search?.trim();

        // Filtro por tipo
        if (filters?.tipo) q = query(q, where("tipo", "==", filters.tipo));

        // Filtro por colecciÃ³n
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

        // Ordenamiento segun opcion seleccionada
        const sortClauses: Array<{
          field: "createdAt" | "precio" | "nombre";
          direction: "asc" | "desc";
        }> = (() => {
          switch (sortBy) {
            case "price-asc":
              return [
                { field: "precio", direction: "asc" },
                { field: "nombre", direction: "asc" },
              ];
            case "price-desc":
              return [
                { field: "precio", direction: "desc" },
                { field: "nombre", direction: "asc" },
              ];
            case "name-asc":
              return [{ field: "nombre", direction: "asc" }];
            case "name-desc":
              return [{ field: "nombre", direction: "desc" }];
            case "newest":
            default:
              return [
                { field: "createdAt", direction: "desc" },
                { field: "nombre", direction: "asc" },
              ];
          }
        })();

        const appliedFields = new Set<string>();
        if (hasPriceFilter && sortClauses[0]?.field !== "precio") {
          q = query(q, orderBy("precio", "asc"));
          appliedFields.add("precio");
        }

        sortClauses.forEach(({ field, direction }) => {
          if (appliedFields.has(field)) return;
          q = query(q, orderBy(field, direction));
          appliedFields.add(field);
        });

        if (!hasSearchFilter) {
          if (pageParam) q = query(q, startAfter(pageParam));
          q = query(q, limit(pageSize));
        }

        // Timeout para detectar â€œse quedÃ³ colgadoâ€
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
            descuento: d.descuento,
            tipo: d.tipo,
            coleccion: d.coleccion,
            nuevo: d.nuevo,
            createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
            imagen: d.imagen,
            imagenAlt: d.imagenAlt,
          } as Product;
        });

        const searchTerm = filters?.search?.trim().toLowerCase() ?? "";
        const normalizedSearch = searchTerm.replace(/\s+/g, " ");

        const filteredProducts =
          normalizedSearch.length > 0
            ? products.filter((product) => {
                const haystack = [
                  product.nombre ?? "",
                  product.tipo ?? "",
                  product.coleccion ?? "",
                ]
                  .join(" ")
                  .toLowerCase()
                  .replace(/\s+/g, " ");
                return haystack.includes(normalizedSearch);
              })
            : products;

        return {
          products: filteredProducts,
          lastDoc: snap.docs[snap.docs.length - 1] ?? null,
          hasMore: normalizedSearch ? false : snap.docs.length === pageSize,
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
      const docRef = doc(db, "productos", productId); // â† CORREGIDO
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Producto no encontrado");
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        nombre: data.nombre,
        precio: data.precio,
        descuento: data.descuento,
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
// Obtener productos por tipo (categorÃ­a)
// ==========================================
export const useProductsByTipo = (tipo: string, limitCount: number = 8) => {
  return useQuery({
    queryKey: ["products-by-tipo", tipo, limitCount],
    queryFn: async () => {
      const q = query(
        collection(db, "productos"), // â† CORREGIDO
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
          descuento: data.descuento,
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
// Obtener productos por colecciÃ³n
// ==========================================
export const useProductsByColeccion = (
  coleccion: string,
  limitCount: number = 8,
) => {
  return useQuery({
    queryKey: ["products-by-coleccion", coleccion, limitCount],
    queryFn: async () => {
      const q = query(
        collection(db, "productos"), // â† CORREGIDO
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
          descuento: data.descuento,
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
        collection(db, "productos"), // â† CORREGIDO
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
            descuento: data.descuento,
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
      const q = query(collection(db, "productos")); // â† CORREGIDO
      const snapshot = await getDocs(q);

      const searchLower = searchQuery.toLowerCase();
      return snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            nombre: data.nombre,
            precio: data.precio,
            descuento: data.descuento,
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
// Obtener productos en oferta (descuento > 0)
// ==========================================
export const useProductsOnOffer = (limitCount: number = 60) => {
  return useQuery({
    queryKey: ["products-on-offer", limitCount],
    queryFn: async () => {
      const q = query(
        collection(db, "productos"),
        where("descuento", ">", 0),
        orderBy("descuento", "desc"),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          nombre: data.nombre,
          precio: data.precio,
          descuento: data.descuento,
          tipo: data.tipo,
          coleccion: data.coleccion,
          nuevo: data.nuevo,
          createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
          imagen: data.imagen,
          imagenAlt: data.imagenAlt,
        } as Product;
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ==========================================
// Obtener todos los tipos Ãºnicos (SIN DUPLICADOS)
// ==========================================
export const useProductTypes = () => {
  return useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "productos")); // â† CORREGIDO
      const types = new Set<string>();

      snapshot.docs.forEach((docSnap) => {
        const tipo = docSnap.data().tipo;
        if (tipo) types.add(tipo); // Set elimina duplicados automÃ¡ticamente
      });

      return Array.from(types).sort(); // Ordenar alfabÃ©ticamente
    },
    staleTime: 1000 * 60 * 10,
  });
};

// ==========================================
// Obtener todas las colecciones Ãºnicas
// ==========================================
export const useColecciones = () => {
  return useQuery({
    queryKey: ["colecciones"],
    queryFn: async () => {
      const adminCollectionsSnapshot = await getDocs(collection(db, "colecciones"));
      const adminCollections = adminCollectionsSnapshot.docs
        .map((docSnap) => docSnap.data())
        .filter((d) => d?.activa !== false && typeof d?.nombre === "string")
        .map((d) => String(d.nombre).trim())
        .filter(Boolean);

      if (adminCollections.length > 0) {
        return Array.from(new Set(adminCollections)).sort();
      }

      const snapshot = await getDocs(collection(db, "productos"));
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


