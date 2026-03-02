// src/app/colecciones/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useColecciones } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionCard } from "./CollectionCard";

// Mapeo de colecciones a imágenes ilustradas
// Ajusta las rutas según donde guardes las imágenes
const coleccionImages: Record<string, string> = {
  Navidad: "/images/colecciones/navidad.png",
  Halloween: "/images/colecciones/halloween.png",
  Colombia: "/images/colecciones/colombia.png",
  Construccion: "/images/colecciones/construccion.png",
  Flores: "/images/colecciones/flores.png",
  "Amor y Amistad": "/images/colecciones/amor-amistad.png",
  Personalizados: "/images/colecciones/personalizados.png",
  "Pulseras Superhéroes": "/images/colecciones/superheroes.png",
  Resina: "/images/colecciones/resina.png",
};

// Colores de fondo para cada colección
const coleccionColors: Record<string, string> = {
  Navidad: "from-red-100 to-green-100",
  Halloween: "from-orange-100 to-amber-100",
  Colombia: "from-yellow-100 to-blue-100",
  Construccion: "from-amber-100 to-yellow-100",
  Flores: "from-pink-100 to-rose-100",
  "Amor y Amistad": "from-rose-100 to-pink-100",
  Personalizados: "from-purple-100 to-pink-100",
};

export default function ColeccionesPage() {
  const { data: colecciones = [], isLoading } = useColecciones();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestras Colecciones
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Descubre colecciones únicas diseñadas para cada ocasión especial
            </p>
          </motion.div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : colecciones.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-6">
              No hay colecciones disponibles en este momento
            </p>
            <Button variant="outline" asChild>
              <Link href="/productos">Ver todos los productos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {colecciones.map((coleccion, index) => {
              const imageSrc =
                coleccionImages[coleccion] || "/images/placeholder.jpg";
              const bgGradient =
                coleccionColors[coleccion] || "from-gray-100 to-gray-200";

              return (
                <CollectionCard
                  key={coleccion}
                  nombre={coleccion}
                  imagen={imageSrc}
                  bgColor={`bg-linear-to-br ${bgGradient}`}
                  index={index}
                />
              );
            })}
          </div>
        )}

        {/* CTA al catálogo completo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            ¿No encuentras lo que buscas?
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link href="/productos">
              Ver todos los productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Sección adicional - Opcional */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Colecciones Temáticas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Cada colección está cuidadosamente diseñada para complementar tus
            momentos más especiales. Desde celebraciones tradicionales hasta
            detalles personalizados únicos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Diseños Únicos</h3>
              <p className="text-sm text-muted-foreground">
                Cada pieza es creada con atención al detalle
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-2">Materiales de Calidad</h3>
              <p className="text-sm text-muted-foreground">
                Seleccionamos los mejores materiales para cada colección
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Personalización</h3>
              <p className="text-sm text-muted-foreground">
                Hacemos realidad tus ideas más creativas
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
