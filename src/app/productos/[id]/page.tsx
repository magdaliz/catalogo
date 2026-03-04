"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/lib/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { useFavorites } from "@/lib/favorites/FavoritesContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  formatPrice,
  getDiscountedPrice,
  hasDiscount,
  normalizeDiscount,
} from "@/lib/utils/formatters";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const { data: product, isLoading, error } = useProduct(id);
  const { addItem, isInCart } = useCartStore();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const inCart = product ? isInCart(product.id) : false;
  const favorite = product ? isFavorite(product.id) : false;
  const discount = normalizeDiscount(product?.descuento);
  const hasProductDiscount = hasDiscount(discount);
  const finalPrice = product
    ? getDiscountedPrice(product.precio, discount)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, 1);
    toast.success("Producto agregado al carrito", {
      description: product.nombre,
    });
  };

  const handleFavorite = async () => {
    if (!product) return;
    if (!user) {
      router.push(`/login?redirect=/productos/${product.id}`);
      return;
    }

    try {
      await toggleFavorite(product);
      toast.success(
        favorite ? "Quitado de favoritos" : "Agregado a favoritos",
      );
    } catch (error: any) {
      toast.error("No se pudo actualizar favoritos", {
        description: error?.code || error?.message || "Error desconocido",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square rounded-xl bg-muted" />
          <div className="space-y-4">
            <div className="h-5 w-28 bg-muted rounded" />
            <div className="h-10 w-3/4 bg-muted rounded" />
            <div className="h-10 w-40 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Producto no encontrado</h1>
        <p className="text-muted-foreground mb-6">
          El producto que intentas ver no existe o fue eliminado.
        </p>
        <Button asChild>
          <Link href="/productos">Volver a productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/productos">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a productos
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border">
          <Image
            src={product.imagen || "/images/placeholder.jpg"}
            alt={product.imagenAlt || product.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.coleccion && (
              <Badge className="bg-purple-500 hover:bg-purple-600">
                {product.coleccion}
              </Badge>
            )}
            {product.nuevo && <Badge variant="destructive">Nuevo</Badge>}
            {hasProductDiscount && (
              <Badge className="bg-red-600 hover:bg-red-700">-{discount}%</Badge>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            {product.tipo}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {product.nombre}
          </h1>

          <div className="flex items-end gap-3">
            {hasProductDiscount ? (
              <>
                <span className="text-4xl font-bold text-black">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-xl text-red-600 line-through">
                  {formatPrice(product.precio)}
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold">
                {formatPrice(product.precio)}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Colección</p>
            <Badge variant="outline" className="text-sm">
              {product.coleccion}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-600 font-medium">Disponible</span>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              variant={inCart ? "secondary" : "default"}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {inCart ? "En el carrito" : "Agregar al carrito"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleFavorite}
            >
              <Heart
                className={`h-5 w-5 mr-2 ${favorite ? "fill-current text-red-500" : ""}`}
              />
              {favorite ? "En favoritos" : "Agregar a favoritos"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
