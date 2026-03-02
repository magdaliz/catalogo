"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
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
import { getWhatsAppCartURL } from "@/lib/utils/whatsapp";

export const CartDrawer = () => {
  const { items, isOpen, closeCart, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const whatsappURL = getWhatsAppCartURL(items);

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>Carrito de compras</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tu carrito esta vacio</h3>
            <p className="text-muted-foreground mb-6">
              Anade productos para comenzar tu compra
            </p>
            <Button onClick={closeCart} asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-5">
                {items.map((item) => (
                  <CartItem
                    key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                    item={item}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-6 pt-5 pb-4 space-y-4 bg-background">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-[#25D366] hover:bg-[#1faa52] text-white"
                  size="lg"
                  asChild
                >
                  <a
                    href={whatsappURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.41 0 .03 5.38.03 12c0 2.12.55 4.2 1.6 6.03L0 24l6.13-1.6A11.95 11.95 0 0 0 12.04 24h.01c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.53-8.52Zm-8.48 18.5h-.01a9.94 9.94 0 0 1-5.07-1.38l-.36-.21-3.64.95.97-3.55-.23-.37a9.9 9.9 0 0 1-1.53-5.28C2.17 6.58 6.62 2.13 12.04 2.13c2.66 0 5.16 1.03 7.04 2.91A9.9 9.9 0 0 1 21.99 12c0 5.42-4.45 9.98-9.95 9.98Zm5.46-7.45c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.49-.9-.8-1.5-1.79-1.67-2.09-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53l-.58-.01c-.2 0-.53.07-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.89 1.23 3.09c.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.63.72.23 1.37.2 1.88.12.57-.08 1.78-.73 2.03-1.44.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
                    </svg>
                    Finalizar por WhatsApp
                  </a>
                </Button>

                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Vaciar carrito
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-1">
                Los costos de envio se calculan en el checkout
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

