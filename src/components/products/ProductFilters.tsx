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
import { SlidersHorizontal, X } from "lucide-react";
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
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedTipo, setSelectedTipo] = useState<string | undefined>(
    initialFilters?.tipo,
  );
  const [selectedColeccion, setSelectedColeccion] = useState<
    string | undefined
  >(initialFilters?.coleccion);

  // Obtener tipos y colecciones desde Firestore
  const { data: tipos = [] } = useProductTypes();
  const { data: colecciones = [] } = useColecciones();

  const applyFilters = () => {
    onFilterChange({
      tipo: selectedTipo,
      coleccion: selectedColeccion,
      minPrecio: priceRange[0],
      maxPrecio: priceRange[1],
    });
  };

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
        <div className="space-y-2">
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
                className="cursor-pointer capitalize"
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
          <div className="space-y-2">
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
                  className="cursor-pointer"
                >
                  {coleccion}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Precio */}
      <div>
        <h3 className="font-semibold mb-3">Rango de precio</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500000}
          step={10000}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0].toLocaleString()}</span>
          <span>${priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="space-y-2 pt-4 border-t">
        <Button onClick={applyFilters} className="w-full">
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
        <SheetContent side="left">
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
