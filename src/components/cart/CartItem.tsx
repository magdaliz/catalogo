// src/components/cart/CartItem.tsx

"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import {
  formatPrice,
  getDiscountedPrice,
  hasDiscount,
  normalizeDiscount,
} from "@/lib/utils/formatters";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleDecrease = () => {
    if (item.cantidad > 1) {
      updateQuantity(item.productId, item.cantidad - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.productId, item.cantidad + 1);
  };

  const discount = normalizeDiscount(item.producto.descuento);
  const hasProductDiscount = hasDiscount(discount);
  const unitOriginalPrice = item.producto.precio;
  const unitFinalPrice = getDiscountedPrice(unitOriginalPrice, discount);
  const subtotal = unitFinalPrice * item.cantidad;

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={item.producto.imagen || "/images/placeholder.jpg"}
          alt={item.producto.imagenAlt || item.producto.nombre}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div>
            <h3 className="font-medium text-sm line-clamp-2">
              {item.producto.nombre}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {item.producto.tipo} • {item.producto.coleccion}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => removeItem(item.productId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Variantes (si existen) */}
        {(item.selectedColor || item.selectedSize) && (
          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
            {item.selectedSize && <span>Talla: {item.selectedSize}</span>}
          </div>
        )}

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDecrease}
              disabled={item.cantidad <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">
              {item.cantidad}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-semibold text-sm text-black">
              {formatPrice(subtotal)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatPrice(unitFinalPrice)} c/u
            </div>
            {hasProductDiscount && (
              <div className="text-xs text-red-600 line-through">
                {formatPrice(unitOriginalPrice)} c/u
              </div>
            )}
            {hasProductDiscount && (
              <div className="text-[11px] text-red-600 font-medium">
                -{discount}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
