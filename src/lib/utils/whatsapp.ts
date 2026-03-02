import { CartItem } from "@/types/product";

const WHATSAPP_PHONE_E164 = "573185289607";

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

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
    const unitPrice = item.producto.precio;
    const subtotal = unitPrice * item.cantidad;
    total += subtotal;

    const variantes: string[] = [];
    if (item.selectedColor) variantes.push(`Color: ${item.selectedColor}`);
    if (item.selectedSize) variantes.push(`Talla: ${item.selectedSize}`);
    const variantesTexto =
      variantes.length > 0 ? ` (${variantes.join(" | ")})` : "";

    lines.push(
      `${index + 1}. ${item.producto.nombre}${variantesTexto}`,
    );
    lines.push(
      `   Cantidad: ${item.cantidad} | Unitario: ${formatCOP(unitPrice)} | Subtotal: ${formatCOP(subtotal)}`,
    );
  });

  lines.push("");
  lines.push(`Total: ${formatCOP(total)}`);
  lines.push("");
  lines.push("Quedo atento(a) a confirmacion de disponibilidad y costos de envio. Gracias.");

  return lines.join("\n");
}

export function getWhatsAppCartURL(items: CartItem[]) {
  const text = buildWhatsAppCartMessage(items);
  return `https://wa.me/${WHATSAPP_PHONE_E164}?text=${encodeURIComponent(text)}`;
}

