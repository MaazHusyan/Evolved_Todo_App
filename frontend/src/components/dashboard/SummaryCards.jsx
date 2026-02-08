"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

export function SummaryCards({ tasks, activeFilter, onFilterClick, className }) {
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => !t.is_completed).length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.is_completed) return false;
    return new Date(t.due_date) < new Date();
  }).length;

  const summaryData = [
    {
      id: "all",
      title: "All Tasks",
      count: totalTasks,
      icon: ListTodo,
      color: "blue",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      hoverBg: "hover:bg-blue-500/5",
    },
    {
      id: "pending",
      title: "Pending",
      count: pendingTasks,
      icon: Circle,
      color: "yellow",
      bgGradient: "from-yellow-500/10 to-orange-600/10",
      borderColor: "border-yellow-500/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      hoverBg: "hover:bg-yellow-500/5",
    },
    {
      id: "completed",
      title: "Completed",
      count: completedTasks,
      icon: CheckCircle2,
      color: "green",
      bgGradient: "from-green-500/10 to-green-600/10",
      borderColor: "border-green-500/30",
      iconColor: "text-green-600 dark:text-green-400",
      hoverBg: "hover:bg-green-500/5",
    },
    {
      id: "overdue",
      title: "Overdue",
      count: overdueTasks,
      icon: Clock,
      color: "red",
      bgGradient: "from-red-500/10 to-red-600/10",
      borderColor: "border-red-500/30",
      iconColor: "text-red-600 dark:text-red-400",
      hoverBg: "hover:bg-red-500/5",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {summaryData.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.id;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => onFilterClick(item.id)}
              className={cn(
                "glass dark:glass-dark border-0 shadow-lg cursor-pointer transition-all duration-300",
                "hover:shadow-xl",
                isActive && "ring-2 ring-offset-2 ring-offset-background",
                isActive && `ring-${item.color}-500`,
                item.hoverBg
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Icon Section */}
                  <div
                    className={cn(
                      "p-3 rounded-xl bg-gradient-to-br",
                      item.bgGradient,
                      "border",
                      item.borderColor
                    )}
                  >
                    <Icon className={cn("h-6 w-6", item.iconColor)} />
                  </div>

                  {/* Count Badge */}
                  <div className="text-right">
                    <motion.div
                      key={item.count}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "text-4xl font-bold bg-gradient-to-br bg-clip-text text-transparent",
                        item.color === "blue" && "from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600",
                        item.color === "yellow" && "from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400",
                        item.color === "green" && "from-green-600 to-green-800 dark:from-green-400 dark:to-green-600",
                        item.color === "red" && "from-red-600 to-red-800 dark:from-red-400 dark:to-red-600"
                      )}
                    >
                      {item.count}
                    </motion.div>
                  </div>
                </div>

                {/* Title */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {isActive ? "Currently viewing" : "Click to filter"}
                  </p>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-1 rounded-b-xl",
                      item.color === "blue" && "bg-blue-600",
                      item.color === "yellow" && "bg-yellow-600",
                      item.color === "green" && "bg-green-600",
                      item.color === "red" && "bg-red-600"
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
