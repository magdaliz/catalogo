// src/components/layout/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Heart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { SearchBar } from "@/components/shared/SearchBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

export const Header = () => {
  const { items, toggleCart, getItemCount } = useCartStore();
  const { user, isAdmin, logout } = useAuth();
  const itemCount = getItemCount();
  const favoritesHref = user ? "/favoritos" : "/login?redirect=/favoritos";
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const userInitial = (user?.displayName?.trim()?.charAt(0) ||
    user?.email?.trim()?.charAt(0) ||
    "U"
  ).toUpperCase();

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.uid, user?.photoURL]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setProfileMenuOpen(false);
      toast.success("Sesion cerrada");
    } catch (error: any) {
      toast.error("No se pudo cerrar sesion", {
        description: error?.code || error?.message || "Error desconocido",
      });
    }
  };

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
                href="/productos?nuevo=1"
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
                <Link href={favoritesHref}>
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
                {isHydrated && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Account */}
              <div className="relative hidden md:flex" ref={profileRef}>
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="overflow-hidden rounded-full"
                      onClick={() => setProfileMenuOpen((prev) => !prev)}
                    >
                      {user.photoURL && !avatarFailed ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "Perfil"}
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarFailed(true)}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                          {userInitial}
                        </div>
                      )}
                    </Button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 top-12 w-72 rounded-lg border bg-background p-4 shadow-lg z-50">
                        <div className="flex items-center gap-3 mb-4">
                          {user.photoURL && !avatarFailed ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || "Perfil"}
                              referrerPolicy="no-referrer"
                              onError={() => setAvatarFailed(true)}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                              {userInitial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {user.displayName || "Usuario"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email || ""}
                            </p>
                          </div>
                        </div>

                        {isAdmin && (
                          <Button
                            variant="outline"
                            className="w-full mb-2"
                            asChild
                          >
                            <Link href="/admin">Portal admin</Link>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="w-full hover:bg-red-600 hover:text-white hover:border-red-600"
                          onClick={handleLogout}
                        >
                          Cerrar sesion
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="hidden md:flex"
                  >
                    <Link href="/login">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>

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
