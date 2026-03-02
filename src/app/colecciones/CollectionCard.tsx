// src/components/colecciones/CollectionCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CollectionCardProps {
  nombre: string;
  imagen: string;
  bgColor: string;
  index: number;
}

export const CollectionCard = ({
  nombre,
  imagen,
  bgColor,
  index,
}: CollectionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -8 }}
    >
      <Link
        href={`/productos?coleccion=${encodeURIComponent(nombre)}`}
        className="group block h-full"
      >
        <div className="rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white h-full flex flex-col">
          {/* Imagen ilustrada */}
          <div
            className={`relative w-full aspect-square ${bgColor} overflow-hidden`}
          >
            {/* Imagen */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={imagen}
                alt={nombre}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>

            {/* Label */}
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-semibold text-gray-600 tracking-wider uppercase">
                Collection
              </span>
            </div>

            {/* Decoración - puntos o elementos del diseño original */}
            <div className="absolute top-8 left-8 opacity-30">
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>
            <div className="absolute bottom-8 right-12 opacity-20">
              <div className="w-3 h-3 rounded-full bg-current" />
            </div>
          </div>

          {/* Info */}
          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-primary transition-colors">
              {nombre}
            </h2>

            <Button
              variant="outline"
              className="w-full mt-auto transition-colors hover:bg-black hover:text-white hover:border-black"
              size="lg"
            >
              VER PRODUCTOS
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
