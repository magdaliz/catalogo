import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Flag, Gem, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative -mt-16 min-h-screen pt-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-300 via-fuchsia-300 to-indigo-200" />
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/8 via-transparent to-white/25" />

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/35 border border-white/60 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-600 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-600" />
              </span>
              <span className="text-sm font-medium text-slate-800">
                Accesorios hechos a mano en Colombia
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight">
              Hecho a mano. Hecho para destacar.
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Accesorios unicos que cuentan tu historia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button size="lg" className="text-lg" asChild>
                <Link href="/productos">
                  Ver coleccion
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg bg-white/55 backdrop-blur-sm border-white/80 text-slate-900 hover:bg-white/75"
                asChild
              >
                <Link href="/colecciones">Colecciones</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 md:h-56 bg-linear-to-t from-white to-transparent" />
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                <Hand className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hecho a mano</h3>
              <p className="text-muted-foreground">
                Cada pieza se elabora artesanalmente con detalle y dedicacion.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-600 mb-4">
                <Flag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% colombiano</h3>
              <p className="text-muted-foreground">
                Diseno local que impulsa talento colombiano y produccion
                nacional.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                <Gem className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personalizados para ti</h3>
              <p className="text-muted-foreground">
                Creamos accesorios unicos segun tu estilo, ocasion o idea.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestra coleccion
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explora nuestros accesorios unicos y encuentra el complemento
              perfecto para tu estilo.
            </p>
          </div>

          <Suspense fallback={<ProductSkeleton count={8} />}>
            <ProductGrid pageSize={12} />
          </Suspense>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/productos">
                Ver todos los productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explora por categoria
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/productos?tipo=aretes"
              className="group relative h-64 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-violet-400 via-fuchsia-300 to-pink-300" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Aretes</h3>
              </div>
            </Link>

            <Link
              href="/productos?tipo=Mu%C3%B1eco"
              className="group relative h-64 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-fuchsia-400 via-purple-300 to-indigo-300" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Munecos</h3>
              </div>
            </Link>

            <Link
              href="/productos?tipo=pulsera"
              className="group relative h-64 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-indigo-400 via-violet-300 to-fuchsia-300" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Pulseras</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl border border-white/60 bg-linear-to-r from-violet-300/85 via-fuchsia-300/85 to-indigo-200/85 px-6 py-14 md:px-12 md:py-16 shadow-2xl backdrop-blur-sm overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-white/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-indigo-300/35 blur-3xl" />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
                Listo para renovar tu estilo?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-slate-700">
                Se parte de quienes ya eligieron calidad y diseno unico.
                Descubre por que nuestras piezas marcan la diferencia.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="text-lg" asChild>
                  <Link href="/productos">
                    Comenzar a comprar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg bg-white/60 hover:bg-white/80 border-white/80 text-slate-900" asChild>
                  <Link href="/colecciones">Ver colecciones</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
