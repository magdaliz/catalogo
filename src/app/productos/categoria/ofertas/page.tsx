"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { useProductsOnOffer } from "@/lib/hooks/useProducts";

export default function OfertasPage() {
  const { data: products = [], isLoading, error } = useProductsOnOffer(80);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-linear-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Tag className="h-6 w-6" />
            <span className="font-semibold uppercase tracking-wide">Ofertas</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Productos en Descuento
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Aprovecha precios especiales por tiempo limitado.
          </p>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <ProductSkeleton count={8} />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No se pudieron cargar las ofertas en este momento.
            </p>
            <Button variant="outline" asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 rounded-xl border bg-card">
            <h2 className="text-2xl font-semibold mb-2">
              No hay ofertas actualmente
            </h2>
            <p className="text-muted-foreground mb-6">
              Por ahora no tenemos productos con descuento activo.
            </p>
            <Button asChild>
              <Link href="/productos">Cargar productos normales</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

