// src/components/layout/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Menu,
  User,
  ShoppingBag,
  Sparkles,
  BadgePercent,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { SearchBar } from "@/components/shared/SearchBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const { toggleCart, closeCart, getItemCount } = useCartStore();
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = getItemCount();
  const favoritesHref = user ? "/favoritos" : "/login?redirect=/favoritos";
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const isHome = pathname === "/";
  const isHomeTop = isHome && !isScrolled;

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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      closeCart();
      toast.success("Sesión cerrada");
      router.replace("/");
      router.refresh();
    } catch (error: any) {
      toast.error("No se pudo cerrar sesión", {
        description: error?.code || error?.message || "Error desconocido",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
          isHomeTop
            ? "border-transparent bg-transparent"
            : isHome
              ? "border-b border-border/60 bg-background/35 backdrop-blur supports-backdrop-filter:bg-background/35"
              : "border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className={`flex items-center space-x-2 transition-all duration-300 ease-out md:mr-6 lg:mr-10 ${
                mobileMenuOpen
                  ? "opacity-0 -translate-y-1 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {!logoFailed ? (
                <Image
                  src="/images/MiyukiTexto.png"
                  alt="Magdaliz Accesorios"
                  width={180}
                  height={52}
                  className="h-11 w-auto object-contain"
                  priority
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <span className="text-2xl font-bold">Magdaliz</span>
              )}
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
                href="/colecciones"
                className="hover:text-primary transition-colors"
              >
                Colecciones
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
              {/* Wishlist */}
              <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
                <Link href={favoritesHref}>
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative hidden md:inline-flex"
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
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
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
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`md:hidden transition-all duration-200 ${
                      mobileMenuOpen
                        ? "opacity-0 pointer-events-none scale-95"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88%] max-w-sm">
                  <SheetHeader>
                    <SheetTitle>
                      <Image
                        src="/images/MiyukiTexto.png"
                        alt="Magdaliz Accesorios"
                        width={160}
                        height={44}
                        className="h-9 w-auto object-contain"
                      />
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-5 px-4 pb-4">
                    <SearchBar />

                    <nav className="grid gap-2">
                      <SheetClose asChild>
                        <Button variant="outline" className="justify-start" asChild>
                          <Link href="/productos">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Productos
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="outline" className="justify-start" asChild>
                          <Link href="/colecciones">
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Colecciones
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="outline" className="justify-start" asChild>
                          <Link href="/productos?nuevo=1">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Nuevos
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="outline" className="justify-start" asChild>
                          <Link href="/productos/categoria/ofertas">
                            <BadgePercent className="h-4 w-4 mr-2" />
                            Ofertas
                          </Link>
                        </Button>
                      </SheetClose>
                    </nav>

                    <div className="grid gap-2">
                      <SheetClose asChild>
                        <Button variant="outline" className="justify-start" asChild>
                          <Link href={favoritesHref}>
                            <Heart className="h-4 w-4 mr-2" />
                            Favoritos
                          </Link>
                        </Button>
                      </SheetClose>

                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          toggleCart();
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Carrito
                        {isHydrated && itemCount > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({itemCount})
                          </span>
                        )}
                      </Button>

                      {user ? (
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          <User className="h-4 w-4 mr-2" />
                          {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                        </Button>
                      ) : (
                        <SheetClose asChild>
                          <Button variant="outline" className="justify-start" asChild>
                            <Link href="/login">
                              <User className="h-4 w-4 mr-2" />
                              Iniciar sesión
                            </Link>
                          </Button>
                        </SheetClose>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
};

