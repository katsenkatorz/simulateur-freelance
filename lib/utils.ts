import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ISResult } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + " €";
}

export function isLabel(is: ISResult): string {
  if (!is || is.total === 0) return "IS : 0 €";
  if (is.is25 === 0) return "IS 15% : " + fmt(is.is15);
  return "IS 15% " + fmt(is.is15) + " + 25% " + fmt(is.is25);
}
