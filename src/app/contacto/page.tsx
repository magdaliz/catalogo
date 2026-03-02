import Link from "next/link";
import { Mail, MessageCircle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contacto</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Estamos listos para ayudarte con tus pedidos, dudas y
            personalizaciones.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border p-6 bg-card">
            <h2 className="text-2xl font-semibold mb-4">Canales de atención</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 mt-1 text-green-600" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    +57 318 528 9607
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <p className="font-medium">Correo</p>
                  <p className="text-sm text-muted-foreground">
                    magdaliz.mlcr@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-1 text-orange-600" />
                <div>
                  <p className="font-medium">Horario</p>
                  <p className="text-sm text-muted-foreground">
                    Lunes a Sábado, 9:00 a.m. - 7:00 p.m.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-pink-600" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-sm text-muted-foreground">Colombia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-6 bg-card">
            <h2 className="text-2xl font-semibold mb-4">Escríbenos rápido</h2>
            <p className="text-muted-foreground mb-6">
              Para una respuesta más rápida, envíanos tu consulta por WhatsApp.
            </p>

            <div className="space-y-3">
              <Button
                className="w-full bg-[#25D366] hover:bg-[#1faa52] text-white"
                asChild
              >
                <a
                  href="https://wa.me/573185289607"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir WhatsApp
                </a>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/faq">Ver preguntas frecuentes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
