import { Product } from "@/types/product";

export const addThreeMonths = (date = new Date()) => {
  const expiry = new Date(date);
  expiry.setMonth(expiry.getMonth() + 3);
  return expiry;
};

export const isProductNew = (product: Product, now = new Date()) =>
  !!product.nuevo && (!product.nuevoHasta || product.nuevoHasta > now);
