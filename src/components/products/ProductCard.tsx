// src/components/products/ProductCard.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  getDiscountedPrice,
  hasDiscount,
  normalizeDiscount,
} from "@/lib/utils/formatters";
import { useFavorites } from "@/lib/favorites/FavoritesContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { addItem, isInCart } = useCartStore();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const inCart = isInCart(product.id);
  const favorite = isFavorite(product.id);
  const discount = normalizeDiscount(product.descuento);
  const hasProductDiscount = hasDiscount(discount);
  const finalPrice = getDiscountedPrice(product.precio, discount);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login?redirect=/favoritos");
      return;
    }

    try {
      await toggleFavorite(product);
      toast.success(
        favorite ? "Quitado de favoritos" : "Agregado a favoritos",
      );
    } catch (error: any) {
      console.error("toggleFavorite error:", error);
      toast.error("No se pudo actualizar favoritos", {
        description: error?.code || error?.message || "Error desconocido",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link href={`/productos/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.coleccion && (
              <Badge className="bg-purple-500 hover:bg-purple-600">
                {product.coleccion}
              </Badge>
            )}
            {product.nuevo && <Badge variant="destructive">Nuevo</Badge>}
            {hasProductDiscount && (
              <Badge className="bg-red-600 hover:bg-red-700">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg"
              onClick={handleFavorite}
            >
              <Heart
                className={`h-4 w-4 ${favorite ? "fill-current text-red-500" : ""}`}
              />
            </Button>
          </div>

          {/* Image */}
          <Image
            src={product.imagen || "/images/placeholder.jpg"}
            alt={product.imagenAlt || product.nombre}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Product info */}
        <div className="mt-4 space-y-2">
          {/* Tipo (Categoría) */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.tipo}
          </p>

          {/* Nombre */}
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.nombre}
          </h3>

          {/* Precio */}
          <div className="flex items-end justify-between gap-2 min-h-8">
            {hasProductDiscount ? (
              <>
                <span className="font-bold text-lg text-black leading-none">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-sm text-red-600 line-through leading-none">
                  {formatPrice(product.precio)}
                </span>
              </>
            ) : (
              <span className="font-bold text-lg leading-none">
                {formatPrice(product.precio)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <Button
        className="w-full mt-3"
        onClick={handleAddToCart}
        variant={inCart ? "secondary" : "default"}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {inCart ? "En el carrito" : "Agregar al carrito"}
      </Button>
    </motion.div>
  );
};
