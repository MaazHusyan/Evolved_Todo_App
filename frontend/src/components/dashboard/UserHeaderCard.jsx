"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LogOut, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserHeaderCard({ user, onLogout, onCreateTask, className }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full", className)}
    >
      <div className="glass dark:glass-dark rounded-2xl p-6 border-0 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          {/* User Info Section */}
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-14 w-14 border-2 border-primary-500/30">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.name || "User"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            {/* Create Task Button - Primary Action */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onCreateTask}
                size="lg"
                className="glass-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Task
              </Button>
            </motion.div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onLogout}
                variant="outline"
                size="icon"
                className="glass dark:glass-dark border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
