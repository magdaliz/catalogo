// src/components/products/FeaturedCategories.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProductTypes } from "@/lib/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const categoryImages = {
  aretes:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
  collares:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
  pulseras:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
  anillos:
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
};

const categoryColors = {
  aretes: "from-purple-400 to-pink-400",
  collares: "from-pink-400 to-orange-400",
  pulseras: "from-orange-400 to-yellow-400",
  anillos: "from-blue-400 to-purple-400",
};

export const FeaturedCategories = () => {
  const { data: tipos, isLoading } = useProductTypes();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!tipos || tipos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tipos.map((tipo, index) => {
        const gradientColor =
          categoryColors[tipo as keyof typeof categoryColors] ||
          "from-gray-400 to-gray-600";

        return (
          <motion.div
            key={tipo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/productos?tipo=${tipo}`}
              className="group block relative h-40 rounded-lg overflow-hidden"
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-xl md:text-2xl font-bold capitalize">
                  {tipo}
                </h3>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 border-2 border-white/50 rounded-lg m-2" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
