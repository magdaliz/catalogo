import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image
              src="/images/MiyukiTexto.png"
              alt="Magdaliz Accesorios"
              width={180}
              height={52}
              className="h-11 w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Los mejores accesorios para complementar tu estilo único.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://www.instagram.com/lizbetmagda/?theme=dark"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://wa.me/573185289607"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                >
                  <path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.41 0 .03 5.38.03 12c0 2.12.55 4.2 1.6 6.03L0 24l6.13-1.6A11.95 11.95 0 0 0 12.04 24h.01c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.53-8.52Zm-8.48 18.5h-.01a9.94 9.94 0 0 1-5.07-1.38l-.36-.21-3.64.95.97-3.55-.23-.37a9.9 9.9 0 0 1-1.53-5.28C2.17 6.58 6.62 2.13 12.04 2.13c2.66 0 5.16 1.03 7.04 2.91A9.9 9.9 0 0 1 21.99 12c0 5.42-4.45 9.98-9.95 9.98Zm5.46-7.45c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.49-.9-.8-1.5-1.79-1.67-2.09-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53l-.58-.01c-.2 0-.53.07-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.89 1.23 3.09c.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.63.72.23 1.37.2 1.88.12.57-.08 1.78-.73 2.03-1.44.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
                </svg>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Productos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/productos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?nuevo=1"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Nuevos ingresos
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/categoria/ofertas"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Ayuda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contacto"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/envios"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Envíos
                </Link>
              </li>
              <li>
                <Link
                  href="/devoluciones"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Suscríbete para recibir ofertas exclusivas.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Magdaliz Accesorios. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
