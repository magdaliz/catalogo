"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Grid3x3, List } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { ProductFilters } from "./ProductFilters";
import { ProductSkeleton } from "./ProductSkeleton";
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
import { ProductFilters as Filters, SortOption } from "@/types/product";
import { useProducts } from "@/lib/hooks/useProducts";

interface ProductsPageContentProps {
  searchParams: {
    tipo?: string;
    coleccion?: string;
    nuevo?: string;
    search?: string;
    ordenar?: string;
  };
}

export const ProductsPageContent = ({
  searchParams,
}: ProductsPageContentProps) => {
  const router = useRouter();
  const sp = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => ({
    tipo: sp.get("tipo") ?? undefined,
    coleccion: sp.get("coleccion") ?? undefined,
    nuevo: sp.get("nuevo") === "1" ? true : undefined,
    search: sp.get("search") ?? undefined,
    minPrecio: sp.get("minPrecio") ? Number(sp.get("minPrecio")) : undefined,
    maxPrecio: sp.get("maxPrecio") ? Number(sp.get("maxPrecio")) : undefined,
  }));

  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.ordenar as SortOption) || "newest",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading } = useProducts(filters, sortBy, 12);
  const allProducts = data?.pages.flatMap((page) => page.products) ?? [];
  const totalProducts = allProducts.length;

  const updateURL = (newFilters: Filters, newSort?: SortOption) => {
    const params = new URLSearchParams();

    if (newFilters.tipo) params.set("tipo", newFilters.tipo);
    if (newFilters.coleccion) params.set("coleccion", newFilters.coleccion);
    if (newFilters.nuevo) params.set("nuevo", "1");
    if (newFilters.search) params.set("search", newFilters.search);
    if (newSort) params.set("ordenar", newSort);

    const url = params.toString()
      ? `/productos?${params.toString()}`
      : "/productos";
    router.push(url);
  };

  const handleFilterChange = (newFilters: Filters) => {
    const nextFilters =
      filters.nuevo && newFilters.nuevo === undefined
        ? { ...newFilters, nuevo: true }
        : newFilters;

    setFilters(nextFilters);
    updateURL(nextFilters, sortBy);
  };

  const handleSortChange = (value: string) => {
    const newSort = value as SortOption;
    setSortBy(newSort);
    updateURL(filters, newSort);
  };

  const removeFilter = (filterKey: keyof Filters) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    updateURL(newFilters, sortBy);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSortBy("newest");
    router.push("/productos");
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const spTipo = sp.get("tipo");
  const spColeccion = sp.get("coleccion");
  const spNuevo = sp.get("nuevo");
  const spSearch = sp.get("search");
  const spMinPrecio = sp.get("minPrecio");
  const spMaxPrecio = sp.get("maxPrecio");

  useEffect(() => {
    const nextFilters: Filters = {
      tipo: spTipo ?? undefined,
      coleccion: spColeccion ?? undefined,
      nuevo: spNuevo === "1" ? true : undefined,
      search: spSearch ?? undefined,
      minPrecio: spMinPrecio ? Number(spMinPrecio) : undefined,
      maxPrecio: spMaxPrecio ? Number(spMaxPrecio) : undefined,
    };

    setFilters((prev) => {
      if (
        prev.tipo === nextFilters.tipo &&
        prev.coleccion === nextFilters.coleccion &&
        prev.nuevo === nextFilters.nuevo &&
        prev.search === nextFilters.search &&
        prev.minPrecio === nextFilters.minPrecio &&
        prev.maxPrecio === nextFilters.maxPrecio
      ) {
        return prev;
      }
      return nextFilters;
    });
  }, [spTipo, spColeccion, spNuevo, spSearch, spMinPrecio, spMaxPrecio]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full md:w-96">
          <SearchBar placeholder="Buscar productos..." autoFocus={false} />
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto justify-end">
          <div className="md:hidden">
            <ProductFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

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

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-45">
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

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center bg-muted/50 p-4 rounded-lg">
          <span className="text-sm font-medium">Filtros activos:</span>

          {filters.tipo && (
            <Badge variant="secondary" className="gap-1 pl-3 pr-2">
              Tipo: <span className="font-semibold capitalize">{filters.tipo}</span>
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
              Colección: <span className="font-semibold">{filters.coleccion}</span>
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
              Búsqueda: <span className="font-semibold">"{filters.search}"</span>
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.nuevo && (
            <Badge variant="secondary" className="gap-1 pl-3 pr-2">
              Nuevos
              <button
                onClick={() => removeFilter("nuevo")}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(filters.minPrecio || filters.maxPrecio) && (
            <Badge variant="secondary" className="gap-1 pl-3 pr-2">
              Precio:{" "}
              <span className="font-semibold">
                ${(filters.minPrecio ?? 0).toLocaleString("es-CO")} - $
                {(filters.maxPrecio ?? 500000).toLocaleString("es-CO")}
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Cargando productos..."
          ) : (
            <>
              <span className="font-semibold text-foreground">{totalProducts}</span>{" "}
              producto{totalProducts !== 1 ? "s" : ""}
              {data?.pages[data.pages.length - 1]?.hasMore && (
                <span> (hay más disponibles)</span>
              )}
            </>
          )}
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-4">
            <ProductFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>
        </aside>

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
