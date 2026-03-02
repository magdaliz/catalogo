import { Truck, Clock3, ShieldCheck, Package } from "lucide-react";

const shippingSteps = [
  {
    title: "Procesamiento",
    detail: "Tu pedido se prepara en 1 a 2 días hábiles.",
    icon: Package,
  },
  {
    title: "Despacho",
    detail: "Se entrega al transportador y recibes confirmación.",
    icon: Truck,
  },
  {
    title: "Entrega",
    detail: "Tiempo estimado: 2 a 6 días hábiles según destino.",
    icon: Clock3,
  },
];

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Envios</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Conoce tiempos, cobertura y recomendaciones para recibir tu pedido.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shippingSteps.map((step) => (
            <div key={step.title} className="rounded-xl border p-5 bg-card">
              <step.icon className="h-6 w-6 text-primary mb-3" />
              <h2 className="font-semibold text-lg mb-2">{step.title}</h2>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-6 bg-card">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 mt-1 text-green-600" />
            <div>
              <h3 className="font-semibold mb-2">Recomendaciones</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Verifica que tus datos de entrega estén correctos.</li>
                <li>Si no estás en casa, deja un contacto alterno.</li>
                <li>Conserva el empaque en caso de cambio o devolución.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
