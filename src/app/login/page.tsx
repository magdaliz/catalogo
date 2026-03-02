"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/favoritos";

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [loading, user, router, redirectTo]);

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      toast.success("Sesión iniciada correctamente");
    } catch (error: any) {
      toast.error("No se pudo iniciar sesión", {
        description: error?.message || "Inténtalo de nuevo",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Accede para guardar favoritos y suscribirte a ofertas exclusivas.
        </p>

        <Button
          onClick={handleGoogleLogin}
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Conectando..." : "Continuar con Google"}
        </Button>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Al continuar, aceptas usar tu cuenta de Google para autenticarte.
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

