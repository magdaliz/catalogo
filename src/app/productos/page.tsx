// src/app/productos/page.tsx

import { Suspense } from "react";
import { ProductsPageContent } from "@/components/products/ProductsPageContent";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";

export const metadata = {
  title: "Productos | Magdaliz Accesorios",
  description:
    "Explora nuestra colección completa de accesorios únicos y encuentra el complemento perfecto para tu estilo",
};

interface ProductsPageProps {
  searchParams: {
    tipo?: string;
    coleccion?: string;
    nuevo?: string;
    search?: string;
    ordenar?: string;
  };
}

export default function ProductosPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header de la página */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nuestra Colección
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Descubre accesorios únicos que complementan tu estilo personal
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ProductSkeleton count={12} />}>
          <ProductsPageContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
