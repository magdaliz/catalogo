"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters as Filters } from "@/types/product";
import { useColecciones, useProductTypes } from "@/lib/hooks/useProducts";

interface ProductFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

const PRICE_MIN = 0;
const PRICE_MAX = 500000;
const PRICE_STEP = 5000;
type DragTarget = "min" | "max" | null;

export const ProductFilters = ({
  onFilterChange,
  initialFilters,
}: ProductFiltersProps) => {
  const lastSyncedFiltersRef = useRef("");
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters?.minPrecio ?? PRICE_MIN,
    initialFilters?.maxPrecio ?? PRICE_MAX,
  ]);
  const [selectedTipo, setSelectedTipo] = useState<string | undefined>(
    initialFilters?.tipo,
  );
  const [selectedColeccion, setSelectedColeccion] = useState<
    string | undefined
  >(initialFilters?.coleccion);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);

  const { data: tipos = [] } = useProductTypes();
  const { data: colecciones = [] } = useColecciones();

  useEffect(() => {
    const snapshot = JSON.stringify({
      minPrecio: initialFilters?.minPrecio ?? PRICE_MIN,
      maxPrecio: initialFilters?.maxPrecio ?? PRICE_MAX,
      tipo: initialFilters?.tipo ?? null,
      coleccion: initialFilters?.coleccion ?? null,
    });

    if (lastSyncedFiltersRef.current === snapshot) return;
    lastSyncedFiltersRef.current = snapshot;

    setPriceRange([
      initialFilters?.minPrecio ?? PRICE_MIN,
      initialFilters?.maxPrecio ?? PRICE_MAX,
    ]);
    setSelectedTipo(initialFilters?.tipo);
    setSelectedColeccion(initialFilters?.coleccion);
  }, [initialFilters]);

  const applyFilters = () => {
    const filters: Filters = {};

    if (selectedTipo) filters.tipo = selectedTipo;
    if (selectedColeccion) filters.coleccion = selectedColeccion;
    if (priceRange[0] > PRICE_MIN) filters.minPrecio = priceRange[0];
    if (priceRange[1] < PRICE_MAX) filters.maxPrecio = priceRange[1];

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedTipo(undefined);
    setSelectedColeccion(undefined);
    onFilterChange({});
  };

  const snapPrice = useCallback((value: number) => {
    const snapped = Math.round(value / PRICE_STEP) * PRICE_STEP;
    return Math.max(PRICE_MIN, Math.min(PRICE_MAX, snapped));
  }, []);

  const priceFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return PRICE_MIN;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const raw = PRICE_MIN + (PRICE_MAX - PRICE_MIN) * ratio;
      return snapPrice(raw);
    },
    [snapPrice],
  );

  const updateDragValue = useCallback(
    (clientX: number, target: "min" | "max") => {
      const nextValue = priceFromClientX(clientX);
      setPriceRange((prev) => {
        if (target === "min") {
          return [Math.min(nextValue, prev[1] - PRICE_STEP), prev[1]];
        }
        return [prev[0], Math.max(nextValue, prev[0] + PRICE_STEP)];
      });
    },
    [priceFromClientX],
  );

  useEffect(() => {
    if (!dragTarget) return;

    const handlePointerMove = (event: PointerEvent) => {
      updateDragValue(event.clientX, dragTarget);
    };

    const handlePointerUp = () => {
      setDragTarget(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragTarget, updateDragValue]);

  const startDrag =
    (target: "min" | "max") =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragTarget(target);
      updateDragValue(event.clientX, target);
    };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const clickedValue = priceFromClientX(event.clientX);
    const distanceToMin = Math.abs(clickedValue - priceRange[0]);
    const distanceToMax = Math.abs(clickedValue - priceRange[1]);
    const target: "min" | "max" =
      distanceToMin <= distanceToMax ? "min" : "max";
    setDragTarget(target);
    updateDragValue(event.clientX, target);
  };

  const minPercent =
    ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPercent =
    ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const selectedWidthPercent = Math.max(maxPercent - minPercent, 0);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Tipo de producto</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tipos.map((tipo) => (
            <div key={tipo} className="flex items-center space-x-2">
              <Checkbox
                id={`tipo-${tipo}`}
                checked={selectedTipo === tipo}
                onCheckedChange={(checked) =>
                  setSelectedTipo(checked ? tipo : undefined)
                }
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

      {colecciones.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Colección</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {colecciones.map((coleccion) => (
              <div key={coleccion} className="flex items-center space-x-2">
                <Checkbox
                  id={`coleccion-${coleccion}`}
                  checked={selectedColeccion === coleccion}
                  onCheckedChange={(checked) =>
                    setSelectedColeccion(checked ? coleccion : undefined)
                  }
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

      <div>
        <h3 className="font-semibold mb-3">Rango de precio</h3>

        <div
          className="relative h-10 mb-2 touch-none select-none cursor-pointer"
          onPointerDown={handleTrackPointerDown}
        >
          <div
            ref={trackRef}
            className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1.5"
          >
            <div className="absolute inset-0 rounded-full bg-muted" />
            <div
              className="absolute h-full rounded-full bg-primary"
              style={{
                left: `${minPercent}%`,
                width: `${selectedWidthPercent}%`,
              }}
            />
            <button
              type="button"
              aria-label="Precio mínimo"
              onPointerDown={startDrag("min")}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border border-primary bg-white shadow-sm cursor-grab active:cursor-grabbing"
              style={{ left: `${minPercent}%` }}
            />
            <button
              type="button"
              aria-label="Precio máximo"
              onPointerDown={startDrag("max")}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border border-primary bg-white shadow-sm cursor-grab active:cursor-grabbing"
              style={{ left: `${maxPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="font-medium">
            ${priceRange[0].toLocaleString("es-CO")}
          </span>
          <span className="font-medium">
            ${priceRange[1].toLocaleString("es-CO")}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Arrastra los controles para ajustar el rango
        </p>
      </div>

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
      <div className="hidden md:block w-64 space-y-6">
        <FilterContent />
      </div>

      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[88%] max-w-sm overflow-y-auto px-4 pb-6"
        >
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
