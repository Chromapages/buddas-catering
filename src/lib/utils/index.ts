import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses any date-like value (Timestamp, ISO string, etc.) into a Date object.
 */
export function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  // Handle Firestore Timestamp
  if (typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // Handle Firestore Timestamp like object { seconds, nanoseconds }
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    return new Date(dateValue.seconds * 1000);
  }
  
  // Handle already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Handle ISO strings or numbers
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(dateValue: any, formatStr: string = "MMM d, yyyy"): string {
  const date = parseDate(dateValue);
  if (!date) return "N/A";
  try {
    const { format: dateFnsFormat } = require("date-fns");
    return dateFnsFormat(date, formatStr);
  } catch (e) {
    return "Invalid Date";
  }
}
