"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LogOut, Plus, User, MessageSquare } from "lucide-react";
import Link from "next/link";
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
      <div className="glass dark:glass-dark rounded-2xl p-4 sm:p-6 border-0 shadow-xl">
        {/* Mobile Layout: Stacked */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* User Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary-500/30">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-base">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {user?.name || "User"}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="icon"
                  className="glass dark:glass-dark border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 h-9 w-9"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                </Button>
              </motion.div>
            </div>
          </div>
          {/* Action Buttons - Full Width on Mobile */}
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Link href="/chat" className="block">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full glass dark:glass-dark border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                >
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  AI Chat
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                onClick={onCreateTask}
                size="lg"
                className="w-full glass-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Task
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Tablet & Desktop Layout: Horizontal */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          {/* User Info Section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-primary-500/30">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-base md:text-lg">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                {user?.name || "User"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* AI Chat Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass dark:glass-dark border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 px-4 md:px-6"
                >
                  <MessageSquare className="h-5 w-5 md:mr-2 text-purple-600 dark:text-purple-400" />
                  <span className="hidden md:inline">AI Chat</span>
                </Button>
              </Link>
            </motion.div>

            {/* Create Task Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onCreateTask}
                size="lg"
                className="glass-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 md:px-6 shadow-lg"
              >
                <Plus className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Create Task</span>
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
