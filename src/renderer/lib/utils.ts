import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString();
};
