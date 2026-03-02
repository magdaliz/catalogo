"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

export function NewsletterForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultEmail = useMemo(() => user?.email ?? "", [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para suscribirte");
      router.push("/login?redirect=/");
      return;
    }

    const targetEmail = (email || defaultEmail).trim();
    if (!targetEmail) {
      toast.error("Ingresa un correo válido");
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "newsletterSubscribers"), {
        uid: user.uid,
        email: targetEmail,
        source: "footer",
        createdAt: serverTimestamp(),
      });

      toast.success("Suscripción registrada");
      setEmail("");
    } catch (error: any) {
      toast.error("No se pudo registrar la suscripción", {
        description: error?.message || "Inténtalo de nuevo",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex gap-2" onSubmit={onSubmit}>
      <input
        type="email"
        placeholder="Tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        <Mail className="h-4 w-4" />
      </button>
    </form>
  );
}

