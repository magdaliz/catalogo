// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { ShoppingCart, Search, Heart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { SearchBar } from "@/components/shared/SearchBar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const Header = () => {
  const { items, toggleCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Miyuki
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/productos"
                className="hover:text-primary transition-colors"
              >
                Productos
              </Link>
              <Link
                href="/productos/categoria/nuevos"
                className="hover:text-primary transition-colors"
              >
                Nuevos
              </Link>
              <Link
                href="/productos/categoria/ofertas"
                className="hover:text-primary transition-colors"
              >
                Ofertas
              </Link>
            </nav>

            {/* Search bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search - Mobile */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/favoritos">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hidden md:flex"
              >
                <Link href="/admin">
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              {/* Mobile menu */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
};
