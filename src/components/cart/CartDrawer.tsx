// src/components/cart/CartDrawer.tsx

"use client";

import { useCartStore } from "@/store/cartStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/utils/formatters";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";

export const CartDrawer = () => {
  const { items, isOpen, closeCart, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Carrito de compras</span>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-muted-foreground mb-6">
              Añade productos para comenzar tu compra
            </p>
            <Button onClick={closeCart} asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <CartItem
                    key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                    item={item}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/carrito">Ver carrito completo</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Vaciar carrito
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Los costos de envío se calculan en el checkout
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
