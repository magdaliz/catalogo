const questions = [
  {
    q: "¿Cómo puedo hacer un pedido?",
    a: "Puedes agregar productos al carrito y finalizar por WhatsApp. Te ayudamos con disponibilidad, pago y envío.",
  },
  {
    q: "¿Qué métodos de pago manejan?",
    a: "Actualmente coordinamos el pago al confirmar tu pedido por WhatsApp.",
  },
  {
    q: "¿Cuánto tarda en llegar mi pedido?",
    a: "Normalmente entre 2 y 6 días hábiles luego del despacho, según tu ciudad.",
  },
  {
    q: "¿Puedo cambiar un producto?",
    a: "Sí, dentro del plazo de cambios y devoluciones, siempre que cumpla las condiciones de estado.",
  },
  {
    q: "¿Tienen productos personalizados?",
    a: "Sí, puedes consultarnos por WhatsApp para validar opciones, tiempos y costo.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Preguntas frecuentes
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Respuestas rápidas sobre pedidos, envíos, pagos y devoluciones.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-3">
          {questions.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border bg-card p-5 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold pr-6 relative">
                {item.q}
                <span className="absolute right-0 top-0 text-muted-foreground group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
