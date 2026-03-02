// src/components/products/ProductQuickView.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
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
import { formatPrice } from "@/lib/utils/formatters";
import { toast } from "sonner";

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

export const ProductQuickView = ({
  product,
  onClose,
}: ProductQuickViewProps) => {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success("Producto agregado al carrito", {
      description: product.nombre,
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <span className="text-3xl font-bold">
                {formatPrice(product.precio)}
              </span>
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
                <Button variant="outline" size="lg" asChild>
                  <Link href={`/productos/${product.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver detalles
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="mr-2 h-4 w-4" />
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
