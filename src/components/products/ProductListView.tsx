// src/components/products/ProductListView.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/formatters";
import { toast } from "sonner";

interface ProductListViewProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

export const ProductListView = ({
  products,
  onQuickView,
}: ProductListViewProps) => {
  const { addItem, isInCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success("Agregado al carrito", {
      description: product.nombre,
    });
  };

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const inCart = isInCart(product.id);

        return (
          <Link
            key={product.id}
            href={`/productos/${product.id}`}
            className="group block"
          >
            <div className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
              {/* Imagen */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.imagen || "/images/placeholder.jpg"}
                  alt={product.imagenAlt || product.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="128px"
                />

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.coleccion && (
                    <Badge className="bg-purple-500 text-xs">
                      {product.coleccion}
                    </Badge>
                  )}
                  {product.nuevo && (
                    <Badge variant="destructive" className="text-xs">
                      Nuevo
                    </Badge>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  {/* Tipo */}
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {product.tipo}
                  </p>

                  {/* Nombre */}
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {product.nombre}
                  </h3>

                  {/* Precio */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatPrice(product.precio)}
                    </span>
                  </div>
                </div>

                {/* Acciones - Desktop */}
                <div className="hidden sm:flex items-center gap-2 mt-4">
                  <Button
                    variant={inCart ? "secondary" : "default"}
                    size="sm"
                    onClick={(e) => handleAddToCart(e, product)}
                    className="flex-1 max-w-[200px]"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {inCart ? "En el carrito" : "Agregar"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleQuickView(e, product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Acciones - Mobile */}
              <div className="flex sm:hidden flex-col gap-2 justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => handleQuickView(e, product)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>

                <Button
                  variant={inCart ? "secondary" : "default"}
                  size="icon"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
