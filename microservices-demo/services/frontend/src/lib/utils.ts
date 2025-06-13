import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPriorityColor(priority: "low" | "medium" | "high"): string {
  switch (priority) {
    case "high":
      return "#f44336";
    case "medium":
      return "#ff9800";
    case "low":
      return "#4caf50";
    default:
      return "#9e9e9e";
  }
}

export function getRoleColor(role: "admin" | "user" | "moderator"): string {
  switch (role) {
    case "admin":
      return "#f44336";
    case "moderator":
      return "#ff9800";
    case "user":
      return "#4caf50";
    default:
      return "#9e9e9e";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
