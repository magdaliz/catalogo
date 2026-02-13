// src/components/products/ProductsPageContent.tsx (CON CONTADOR CORRECTO)
"use client";

import { useState } from "react";
import { ProductGrid } from "./ProductGrid";
import { ProductFilters } from "./ProductFilters";
import { ProductSkeleton } from "./ProductSkeleton";
import { FeaturedCategories } from "./FeaturedCategories";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/SearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { ProductFilters as Filters, SortOption } from "@/types/product";
import { useProducts } from "@/lib/hooks/useProducts";
import { useRouter } from "next/navigation";

interface ProductsPageContentProps {
  searchParams: {
    tipo?: string;
    coleccion?: string;
    search?: string;
    ordenar?: string;
  };
}

export const ProductsPageContent = ({
  searchParams,
}: ProductsPageContentProps) => {
  const router = useRouter();

  // Estados
  const [filters, setFilters] = useState<Filters>({
    tipo: searchParams.tipo,
    coleccion: searchParams.coleccion,
    search: searchParams.search,
  });
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.ordenar as SortOption) || "newest",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Datos con paginación infinita
  const { data, isLoading } = useProducts(filters, sortBy, 12);

  // Acumular productos de todas las páginas para el contador
  const allProducts = data?.pages.flatMap((page) => page.products) ?? [];
  const totalProducts = allProducts.length;

  // Actualizar URL cuando cambien los filtros
  const updateURL = (newFilters: Filters, newSort?: SortOption) => {
    const params = new URLSearchParams();

    if (newFilters.tipo) params.set("tipo", newFilters.tipo);
    if (newFilters.coleccion) params.set("coleccion", newFilters.coleccion);
    if (newFilters.search) params.set("search", newFilters.search);
    if (newSort) params.set("ordenar", newSort);

    const url = params.toString()
      ? `/productos?${params.toString()}`
      : "/productos";
    router.push(url);
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateURL(newFilters, sortBy);
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (value: string) => {
    const newSort = value as SortOption;
    setSortBy(newSort);
    updateURL(filters, newSort);
  };

  // Limpiar filtro individual
  const removeFilter = (filterKey: keyof Filters) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    updateURL(newFilters, sortBy);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({});
    setSortBy("newest");
    router.push("/productos");
  };

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="space-y-8">
      {/* Categorías destacadas - Solo si no hay filtros activos */}
      {!hasActiveFilters && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Explora por categoría</h2>
          <FeaturedCategories />
        </div>
      )}

      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Búsqueda */}
        <div className="w-full md:w-96">
          <SearchBar placeholder="Buscar productos..." autoFocus={false} />
        </div>

        {/* Controles de vista y ordenamiento */}
        <div className="flex gap-2 items-center w-full md:w-auto justify-end">
          {/* Toggle de filtros - Mobile */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Vista Grid/List */}
          <div className="hidden sm:flex border rounded-lg p-1 bg-muted/50">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Ordenamiento */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
              <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center bg-muted/50 p-4 rounded-lg">
          <span className="text-sm font-medium">Filtros activos:</span>

          {filters.tipo && (
            <Badge variant="secondary" className="gap-1 pl-3 pr-2">
              Tipo:{" "}
              <span className="font-semibold capitalize">{filters.tipo}</span>
              <button
                onClick={() => removeFilter("tipo")}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.coleccion && (
            <Badge variant="secondary" className="gap-1 pl-3 pr-2">
              Colección:{" "}
              <span className="font-semibold">{filters.coleccion}</span>
              <button
                onClick={() => removeFilter("coleccion")}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.search && (
            <Badge variant="secondary" className="gap-1 pl-3 pr-2">
              Búsqueda:{" "}
              <span className="font-semibold">"{filters.search}"</span>
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.minPrecio && filters.maxPrecio && (
            <Badge variant="secondary" className="gap-1 pl-3 pr-2">
              Precio:{" "}
              <span className="font-semibold">
                ${filters.minPrecio.toLocaleString()} - $
                {filters.maxPrecio.toLocaleString()}
              </span>
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters.minPrecio;
                  delete newFilters.maxPrecio;
                  handleFilterChange(newFilters);
                }}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-destructive hover:text-destructive ml-auto"
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Contador de resultados - CORREGIDO */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Cargando productos..."
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {totalProducts}
              </span>{" "}
              producto{totalProducts !== 1 ? "s" : ""}
              {data?.pages[data.pages.length - 1]?.hasMore && (
                <span> (mostrando {totalProducts}, hay más disponibles)</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Layout principal */}
      <div className="flex gap-8">
        {/* Filtros laterales - Desktop */}
        <aside
          className={`
          ${showFilters ? "block" : "hidden"} 
          md:block 
          w-full md:w-64 
          flex-shrink-0
        `}
        >
          <div className="sticky top-4">
            <div className="mb-4 md:hidden">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar filtros
              </Button>
            </div>

            <ProductFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>
        </aside>

        {/* Grid/Lista de productos */}
        <main className="flex-1 min-w-0">
          {isLoading ? (
            <ProductSkeleton count={12} />
          ) : (
            <ProductGrid
              filters={filters}
              sortBy={sortBy}
              pageSize={12}
              viewMode={viewMode}
            />
          )}
        </main>
      </div>
    </div>
  );
};
