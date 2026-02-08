"use client";

import { useToast } from "@/hooks/use-toast";

export function useTaskNotifications() {
  const { toast } = useToast();

  const showCreated = (title) => {
    toast({
      title: "Task created",
      description: `"${title}" has been added to your list.`,
    });
  };

  const showUpdated = (title) => {
    toast({
      title: "Task updated",
      description: `"${title}" has been updated successfully.`,
    });
  };

  const showDeleted = () => {
    toast({
      title: "Task deleted",
      description: "The task has been permanently removed.",
      variant: "destructive",
    });
  };

  const showCompleted = (title) => {
    toast({
      title: "Task completed",
      description: `"${title}" has been marked as complete.`,
    });
  };

  const showError = (message) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  return {
    showCreated,
    showUpdated,
    showDeleted,
    showCompleted,
    showError,
  };
}
