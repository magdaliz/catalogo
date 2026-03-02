// src/lib/utils/formatters.ts

/**
 * Formatea un número como precio en COP (Peso Colombiano)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Valida si un producto tiene descuento utilizable
 */
export const hasDiscount = (discount?: number): boolean => {
  return typeof discount === "number" && discount > 0;
};

/**
 * Retorna porcentaje de descuento normalizado entre 0 y 100
 */
export const normalizeDiscount = (discount?: number): number => {
  if (typeof discount !== "number" || Number.isNaN(discount)) return 0;
  if (discount < 0) return 0;
  if (discount > 100) return 100;
  return discount;
};

/**
 * Calcula el precio final aplicando descuento porcentual
 */
export const getDiscountedPrice = (
  originalPrice: number,
  discount?: number,
): number => {
  const d = normalizeDiscount(discount);
  if (d <= 0) return originalPrice;
  const discounted = originalPrice * (1 - d / 100);
  return Math.round(discounted);
};

/**
 * Formatea una fecha en formato largo (español)
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

/**
 * Formatea una fecha en formato corto
 */
export const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Trunca un texto a una longitud máxima
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * Convierte un texto a slug (URL-friendly)
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

/**
 * Formatea un número como porcentaje
 */
export const formatPercentage = (
  value: number,
  decimals: number = 0,
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("es-CO").format(value);
};

/**
 * Calcula el porcentaje de descuento
 */
export const calculateDiscount = (
  originalPrice: number,
  discountedPrice: number,
): number => {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Formatea el tamaño de un archivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitaliza cada palabra
 */
export const capitalizeWords = (text: string): string => {
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};
