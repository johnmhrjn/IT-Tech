import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function calculateGST(amount: number): number {
  return Math.round(amount * 0.1 * 100) / 100;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TN-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getAgeLabel(min: number, max: number): string {
  if (max >= 12) return `${min}+ years`;
  return `${min}-${max} years`;
}

export const AGE_RANGES = [
  { label: "0-2 years", min: 0, max: 2 },
  { label: "3-5 years", min: 3, max: 5 },
  { label: "6-8 years", min: 6, max: 8 },
  { label: "9-12 years", min: 9, max: 12 },
];

export const SAFETY_BADGES = ["CE", "ASTM", "AS/NZS", "EN71", "CPSC"];

export const AU_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];
