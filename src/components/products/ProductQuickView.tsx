// src/components/products/ProductQuickView.tsx

"use client";

import Image from "next/image";
import { ShoppingCart, Heart, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import {
  formatPrice,
  getDiscountedPrice,
  hasDiscount,
  normalizeDiscount,
} from "@/lib/utils/formatters";
import { toast } from "sonner";
import { useFavorites } from "@/lib/favorites/FavoritesContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

export const ProductQuickView = ({
  product,
  onClose,
}: ProductQuickViewProps) => {
  const { addItem } = useCartStore();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const favorite = isFavorite(product.id);
  const discount = normalizeDiscount(product.descuento);
  const hasProductDiscount = hasDiscount(discount);
  const finalPrice = getDiscountedPrice(product.precio, discount);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success("Producto agregado al carrito", {
      description: product.nombre,
    });
    onClose();
  };

  const handleFavorite = async () => {
    if (!user) {
      onClose();
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

  const handleViewDetails = () => {
    onClose();
    router.push(`/productos/${product.id}`);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Vista rápida de {product.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={product.imagen || "/images/placeholder.jpg"}
                alt={product.imagenAlt || product.nombre}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Badge de colección */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
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
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-4">
            {/* Tipo (Categoría) */}
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.tipo}
            </p>

            {/* Nombre */}
            <h2 className="text-2xl font-bold">{product.nombre}</h2>

            {/* Precio */}
            <div className="flex items-baseline gap-3">
              {hasProductDiscount ? (
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-black">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="text-lg text-red-600 line-through">
                    {formatPrice(product.precio)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold">
                  {formatPrice(product.precio)}
                </span>
              )}
            </div>

            {/* Colección */}
            {product.coleccion && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Colección</p>
                <Badge variant="outline" className="text-sm">
                  {product.coleccion}
                </Badge>
              </div>
            )}

            {/* Disponibilidad */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-600 font-medium">Disponible</span>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button className="w-full" size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al carrito
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full px-4 md:px-5"
                  onClick={handleViewDetails}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="md:hidden">Ver detalles</span>
                  <span className="hidden md:inline">Detalles</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full px-4 md:px-5"
                  onClick={handleFavorite}
                >
                  <Heart
                    className={`h-4 w-4 shrink-0 ${favorite ? "fill-current text-red-500" : ""}`}
                  />
                  Favoritos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
