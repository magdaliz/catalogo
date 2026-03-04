"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.21 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.012 12 24 12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.386 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.145 35.091 26.717 36 24 36c-5.19 0-9.625-3.329-11.283-7.946l-6.52 5.025C9.468 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.57l.003-.002 6.19 5.238C37.004 39.148 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

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
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-7 sm:p-8 shadow-lg">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Acceso seguro
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Entra con tu cuenta de Google para guardar favoritos y recibir
            ofertas exclusivas.
          </p>
        </div>

        <Button
          onClick={handleGoogleLogin}
          size="lg"
          disabled={isSubmitting}
          className="w-full h-12 bg-white text-black border border-gray-300 hover:bg-gray-50"
        >
          <GoogleLogo />
          {isSubmitting ? "Conectando con Google..." : "Continuar con Google"}
        </Button>

        <div className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
          Solo usamos tu cuenta para autenticarte. No publicamos nada ni
          compartimos tus datos.
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
