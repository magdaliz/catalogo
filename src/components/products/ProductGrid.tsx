// src/components/products/ProductGrid.tsx (CON PAGINACIÓN)
"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductListView } from "./ProductListView";
import { ProductQuickView } from "./ProductQuickView";
import { ProductSkeleton, ProductListSkeleton } from "./ProductSkeleton";
import { Product, ProductFilters, SortOption } from "@/types/product";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  filters?: ProductFilters;
  sortBy?: SortOption;
  pageSize?: number;
  viewMode?: "grid" | "list";
}

export const ProductGrid = ({
  filters,
  sortBy = "newest",
  pageSize = 12,
  viewMode = "grid",
}: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Hook con paginación infinita
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(filters, sortBy, pageSize);

  // Acumular productos de todas las páginas
  const products = data?.pages.flatMap((page) => page.products) ?? [];

  if (isLoading) {
    return viewMode === "grid" ? (
      <ProductSkeleton count={pageSize} />
    ) : (
      <ProductListSkeleton count={pageSize} />
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-2">Error al cargar productos</p>
        <pre className="text-xs opacity-80 whitespace-pre-wrap max-w-2xl mx-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            No se encontraron productos
          </h3>
          <p className="text-muted-foreground mb-6">
            Intenta ajustar los filtros o busca algo diferente
          </p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/productos")}
          >
            Ver todos los productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid o lista de productos */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setSelectedProduct}
            />
          ))}
        </div>
      ) : (
        <ProductListView products={products} onQuickView={setSelectedProduct} />
      )}

      {/* Botón "Cargar más" */}
      {hasNextPage && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            size="lg"
            variant="outline"
            className="min-w-50"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>Cargar más productos</>
            )}
          </Button>
        </div>
      )}

      {/* Mensaje cuando se llegó al final */}
      {!hasNextPage && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            ✨ Has visto todos los productos disponibles
          </p>
        </div>
      )}

      {/* Quick view modal */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
