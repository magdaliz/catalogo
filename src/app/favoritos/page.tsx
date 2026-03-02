"use client";

import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useFavorites } from "@/lib/favorites/FavoritesContext";

export default function FavoritosPage() {
  const { user, loading } = useAuth();
  const { favorites, loading: loadingFavorites } = useFavorites();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold">Favoritos</h1>
          <p className="text-muted-foreground">
            Debes iniciar sesión para ver y guardar productos favoritos.
          </p>
          <Button asChild>
            <Link href="/login?redirect=/favoritos">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Mis favoritos</h1>

      {loadingFavorites ? (
        <p className="text-muted-foreground">Cargando favoritos...</p>
      ) : favorites.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Aún no tienes productos en favoritos.
          </p>
          <Button asChild variant="outline">
            <Link href="/productos">Explorar productos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

