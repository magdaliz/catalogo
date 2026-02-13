// src/lib/utils/cn.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina class names de manera inteligente usando clsx y tailwind-merge
 * Útil para componentes que aceptan className como prop
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
