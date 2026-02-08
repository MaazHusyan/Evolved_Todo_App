"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskProgress({ tasks, className }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.is_completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.is_completed) return false;
    return new Date(t.due_date) < new Date();
  }).length;

  // Animate progress on mount/update
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getProgressColor = () => {
    if (percentage === 0) return "from-gray-400 to-gray-500";
    if (percentage === 100) return "from-green-400 to-green-600";
    if (percentage >= 50) return "from-blue-400 to-blue-600";
    return "from-yellow-400 to-orange-500";
  };

  const getProgressMessage = () => {
    if (percentage === 100) return "All tasks completed! 🎉";
    if (percentage >= 75) return "Almost there! Keep going! 💪";
    if (percentage >= 50) return "Great progress! 🚀";
    if (percentage >= 25) return "You're making progress! 📈";
    if (percentage > 0) return "Just getting started! ✨";
    return "No tasks completed yet";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn("glass dark:glass-dark border-0 shadow-xl overflow-hidden", className)}>
        <CardHeader className="pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              Task Progress
            </CardTitle>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {percentage}%
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {getProgressMessage()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="relative">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                    getProgressColor()
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {completed} of {total} tasks completed
              </span>
              {total > 0 && (
                <span className="text-gray-500 dark:text-gray-500 text-xs">
                  {pending} remaining
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Completed */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass dark:glass-dark rounded-xl p-4 border border-green-500/20 bg-green-500/5"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {completed}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Completed
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pending */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass dark:glass-dark rounded-xl p-4 border border-blue-500/20 bg-blue-500/5"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Circle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {pending}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Pending
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Overdue */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass dark:glass-dark rounded-xl p-4 border border-red-500/20 bg-red-500/5"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 rounded-full bg-red-500/10">
                  <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {overdue}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Overdue
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
