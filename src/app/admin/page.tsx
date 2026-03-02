"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { AdminCollectionsManager } from "@/components/admin/AdminCollectionsManager";
import { AdminPromotionsManager } from "@/components/admin/AdminPromotionsManager";

type AdminTab = "productos" | "colecciones" | "promociones";

export default function AdminPage() {
  const { loading, user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("productos");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-3">Acceso restringido</h1>
        <p className="text-muted-foreground mb-6">
          Debes iniciar sesión para acceder al portal admin.
        </p>
        <Button asChild>
          <Link href="/login?redirect=/admin">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-3">Sin permisos de admin</h1>
        <p className="text-muted-foreground mb-6">
          Tu cuenta no tiene permisos para esta sección.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Portal admin</h1>
      <p className="text-muted-foreground mb-8">
        Gestión centralizada de catálogo, colecciones y promociones.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeTab === "productos" ? "default" : "outline"}
          onClick={() => setActiveTab("productos")}
        >
          Productos
        </Button>
        <Button
          variant={activeTab === "colecciones" ? "default" : "outline"}
          onClick={() => setActiveTab("colecciones")}
        >
          Colecciones
        </Button>
        <Button
          variant={activeTab === "promociones" ? "default" : "outline"}
          onClick={() => setActiveTab("promociones")}
        >
          Promociones
        </Button>
      </div>

      {activeTab === "productos" && <AdminProductsManager />}
      {activeTab === "colecciones" && <AdminCollectionsManager />}
      {activeTab === "promociones" && <AdminPromotionsManager />}
    </div>
  );
}

