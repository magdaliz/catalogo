import { RotateCcw, CircleAlert, CheckCircle2 } from "lucide-react";

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Devoluciones</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Queremos que compres con confianza. Aquí encuentras nuestra política
            de cambios y devoluciones.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 space-y-6">
        <div className="rounded-xl border p-6 bg-card">
          <div className="flex items-start gap-3">
            <RotateCcw className="h-5 w-5 mt-1 text-primary" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Plazo de solicitud</h2>
              <p className="text-sm text-muted-foreground">
                Puedes solicitar cambio o devolución dentro de los primeros 5
                días hábiles desde la entrega.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-6 bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Condiciones aceptadas
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Producto sin uso y en buen estado.</li>
              <li>Empaque original y accesorios completos.</li>
              <li>Soporte de compra disponible.</li>
            </ul>
          </div>

          <div className="rounded-xl border p-6 bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CircleAlert className="h-5 w-5 text-orange-600" />
              No aplica para
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Productos personalizados bajo pedido.</li>
              <li>Artículos en promoción final o liquidación.</li>
              <li>Daños por uso indebido.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border p-6 bg-card">
          <p className="text-sm text-muted-foreground">
            Para iniciar el proceso, escríbenos por WhatsApp con número de
            pedido, fotos y motivo de la solicitud.
          </p>
        </div>
      </section>
    </div>
  );
}
