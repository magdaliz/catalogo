// src/components/products/ProductFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { ProductFilters as Filters } from "@/types/product";
import { useProductTypes, useColecciones } from "@/lib/hooks/useProducts";

interface ProductFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

export const ProductFilters = ({
  onFilterChange,
  initialFilters,
}: ProductFiltersProps) => {
  // Estados internos (NO se aplican hasta presionar el botón)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters?.minPrecio ?? 0,
    initialFilters?.maxPrecio ?? 500000,
  ]);
  const [selectedTipo, setSelectedTipo] = useState<string | undefined>(
    initialFilters?.tipo,
  );
  const [selectedColeccion, setSelectedColeccion] = useState<
    string | undefined
  >(initialFilters?.coleccion);

  // Obtener tipos y colecciones desde Firestore (ya sin duplicados)
  const { data: tipos = [] } = useProductTypes();
  const { data: colecciones = [] } = useColecciones();

  // Sincronizar con filtros externos si cambian
  useEffect(() => {
    if (initialFilters) {
      setPriceRange([
        initialFilters.minPrecio ?? 0,
        initialFilters.maxPrecio ?? 500000,
      ]);
      setSelectedTipo(initialFilters.tipo);
      setSelectedColeccion(initialFilters.coleccion);
    }
  }, [initialFilters]);

  // Aplicar filtros (llamar a Firestore)
  const applyFilters = () => {
    const filters: Filters = {};

    if (selectedTipo) {
      filters.tipo = selectedTipo;
    }

    if (selectedColeccion) {
      filters.coleccion = selectedColeccion;
    }

    // Solo agregar precio si es diferente al rango completo
    if (priceRange[0] > 0) {
      filters.minPrecio = priceRange[0];
    }

    if (priceRange[1] < 500000) {
      filters.maxPrecio = priceRange[1];
    }

    onFilterChange(filters);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setPriceRange([0, 500000]);
    setSelectedTipo(undefined);
    setSelectedColeccion(undefined);
    onFilterChange({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Tipos (Categorías) */}
      <div>
        <h3 className="font-semibold mb-3">Tipo de producto</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tipos.map((tipo) => (
            <div key={tipo} className="flex items-center space-x-2">
              <Checkbox
                id={`tipo-${tipo}`}
                checked={selectedTipo === tipo}
                onCheckedChange={(checked) => {
                  setSelectedTipo(checked ? tipo : undefined);
                }}
              />
              <Label
                htmlFor={`tipo-${tipo}`}
                className="cursor-pointer capitalize text-sm"
              >
                {tipo}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Colecciones */}
      {colecciones.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Colección</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {colecciones.map((coleccion) => (
              <div key={coleccion} className="flex items-center space-x-2">
                <Checkbox
                  id={`coleccion-${coleccion}`}
                  checked={selectedColeccion === coleccion}
                  onCheckedChange={(checked) => {
                    setSelectedColeccion(checked ? coleccion : undefined);
                  }}
                />
                <Label
                  htmlFor={`coleccion-${coleccion}`}
                  className="cursor-pointer text-sm"
                >
                  {coleccion}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Precio - SLIDER FLUIDO */}
      <div>
        <h3 className="font-semibold mb-3">Rango de precio</h3>

        {/* Slider con dos thumbs, smooth dragging */}
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => {
              // Actualiza el estado local inmediatamente (drag fluido)
              setPriceRange(value as [number, number]);
            }}
            min={0}
            max={500000}
            step={5000} // Paso de 5000 COP para que sea smooth pero razonable
            className="mb-6"
          />
        </div>

        {/* Mostrar valores actuales */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="font-medium">
            ${priceRange[0].toLocaleString("es-CO")}
          </span>
          <span className="font-medium">
            ${priceRange[1].toLocaleString("es-CO")}
          </span>
        </div>

        {/* Ayuda visual */}
        <p className="text-xs text-muted-foreground mt-2">
          Arrastra los controles para ajustar el rango
        </p>
      </div>

      {/* Botones */}
      <div className="space-y-2 pt-4 border-t">
        <Button onClick={applyFilters} className="w-full" size="lg">
          Aplicar filtros
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Limpiar filtros
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-64 space-y-6">
        <FilterContent />
      </div>

      {/* Mobile */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-75 sm:w-100 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
