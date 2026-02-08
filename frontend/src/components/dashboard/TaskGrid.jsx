"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "@/components/task/TaskCard";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskGrid({
  tasks,
  loading,
  onToggle,
  onEdit,
  onDelete,
  emptyMessage = "No tasks found",
  className,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading your tasks...
          </p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center space-y-4 glass dark:glass-dark rounded-2xl p-12 border-0 shadow-xl">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {emptyMessage}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first task to get started!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              layout: { duration: 0.3 },
            }}
          >
            <TaskCard
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
