import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPriorityColor(priority) {
  const colors = {
    high: "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-200 border-red-500/50 dark:border-red-500/60",
    medium: "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-200 border-yellow-500/50 dark:border-yellow-500/60",
    low: "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-200 border-green-500/50 dark:border-green-500/60",
  };
  return colors[priority] || "bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-200 border-gray-500/50 dark:border-gray-500/60";
}

export function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function calculateProgress(tasks) {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.is_completed).length;
  return Math.round((completed / tasks.length) * 100);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}
