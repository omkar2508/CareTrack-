import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcBMI(weightKg: number, heightCm: number): string {
  const h = heightCm / 100;
  return (weightKg / (h * h)).toFixed(1);
}
