// src/types/product.ts

// Tipo principal del producto - coincide con tu backend actual
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  tipo: string; // ej: "aretes", "collares", "pulseras"
  coleccion: string; // ej: "Personalizados", "Premium", etc.
  imagen: string;
  imagenAlt?: string;
}

// Tipo extendido para el frontend (campos adicionales opcionales)
export interface ProductExtended extends Product {
  descripcion?: string;
  stock?: number;
  descuento?: number;
  destacado?: boolean;
  nuevo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Categorías basadas en "tipo"
export interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen?: string;
  orden?: number;
  productCount?: number;
}

// Colecciones basadas en "coleccion"
export interface Coleccion {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen?: string;
}

// Item del carrito
export interface CartItem {
  productId: string;
  producto: Product;
  cantidad: number;
  selectedColor?: string;
  selectedSize?: string;
}

// Item de favoritos
export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

// Filtros de productos
export interface ProductFilters {
  tipo?: string; // Filtrar por tipo (categoría)
  coleccion?: string; // Filtrar por colección
  minPrecio?: number;
  maxPrecio?: number;
  search?: string; // Búsqueda por nombre
}

// Opciones de ordenamiento
export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "popular";

// Respuesta paginada de productos
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Helpers para conversión de nombres de campos
export const ProductFieldMap = {
  // Backend → Frontend
  nombre: "name",
  precio: "price",
  tipo: "category",
  imagen: "image",
  imagenAlt: "imageAlt",

  // Frontend → Backend
  name: "nombre",
  price: "precio",
  category: "tipo",
  image: "imagen",
  imageAlt: "imagenAlt",
} as const;
