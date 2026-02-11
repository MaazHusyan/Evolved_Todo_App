"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";

export function TaskDialog({ open, onOpenChange, task, onSubmit }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onSubmit(data, task?.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden overflow-x-hidden no-scrollbar [&>div]:overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {task
              ? "Update your task details below. Click save when you're done."
              : "Fill in the details below to create a new task."}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto overflow-x-hidden no-scrollbar [&>_*]:overflow-x-hidden">
          <TaskForm
            initialData={
              task
                ? {
                    title: task.title,
                    description: task.description || "",
                    start_date: formatDateForInput(task.start_date),
                    due_date: formatDateForInput(task.due_date),
                    priority: task.priority || "",
                    tags: task.tags || [],
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => handleClose()}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
