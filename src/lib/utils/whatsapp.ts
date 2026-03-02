import { CartItem } from "@/types/product";
import {
  formatPrice,
  getDiscountedPrice,
  hasDiscount,
  normalizeDiscount,
} from "@/lib/utils/formatters";

const WHATSAPP_PHONE_E164 = "573185289607";

export function buildWhatsAppCartMessage(items: CartItem[]) {
  const lines: string[] = [];
  const now = new Date();

  lines.push("Hola, quiero realizar este pedido:");
  lines.push("");
  lines.push(`Fecha: ${now.toLocaleDateString("es-CO")} ${now.toLocaleTimeString("es-CO")}`);
  lines.push("");
  lines.push("Productos:");

  let total = 0;

  items.forEach((item, index) => {
    const discount = normalizeDiscount(item.producto.descuento);
    const hasProductDiscount = hasDiscount(discount);
    const unitPrice = item.producto.precio;
    const finalUnitPrice = getDiscountedPrice(unitPrice, discount);
    const subtotal = finalUnitPrice * item.cantidad;
    total += subtotal;

    const variantes: string[] = [];
    if (item.selectedColor) variantes.push(`Color: ${item.selectedColor}`);
    if (item.selectedSize) variantes.push(`Talla: ${item.selectedSize}`);
    const variantesTexto =
      variantes.length > 0 ? ` (${variantes.join(" | ")})` : "";

    lines.push(
      `${index + 1}. ${item.producto.nombre}${variantesTexto}`,
    );
    if (hasProductDiscount) {
      lines.push(
        `   Dcto: ${discount}% | Antes: ${formatPrice(unitPrice)} | Ahora: ${formatPrice(finalUnitPrice)}`,
      );
    } else {
      lines.push(`   Precio unitario: ${formatPrice(finalUnitPrice)}`);
    }
    lines.push(`   Cantidad: ${item.cantidad} | Subtotal: ${formatPrice(subtotal)}`);
  });

  lines.push("");
  lines.push(`Total: ${formatPrice(total)}`);
  lines.push("");
  lines.push("Quedo atento(a) a confirmacion de disponibilidad y costos de envio. Gracias.");

  return lines.join("\n");
}

export function getWhatsAppCartURL(items: CartItem[]) {
  const text = buildWhatsAppCartMessage(items);
  return `https://wa.me/${WHATSAPP_PHONE_E164}?text=${encodeURIComponent(text)}`;
}
