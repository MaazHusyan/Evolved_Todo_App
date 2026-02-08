"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export function ControlSidebar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onDeleteAll,
  activeFilters = {},
  onFilterChange,
  className,
}) {
  const priorities = ["low", "medium", "high", "urgent"];
  const quickTags = ["Work", "Personal", "Study", "Bug", "Feature", "Urgent"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn("w-full h-full", className)}
    >
      <div className="glass dark:glass-dark rounded-2xl p-6 border-0 shadow-xl h-full flex flex-col gap-6">
        {/* Sidebar Header */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Control Panel
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Search and filter your tasks
          </p>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Tasks
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 glass-input"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Priority Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Filter by Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => {
              const isActive = activeFilters.priorities?.includes(priority);
              return (
                <Badge
                  key={priority}
                  onClick={() => onFilterChange?.("priority", priority)}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Quick Tags */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Tags</Label>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => {
              const isActive = activeFilters.tags?.includes(tag);
              return (
                <Badge
                  key={tag}
                  onClick={() => onFilterChange?.("tag", tag)}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isActive
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Filter by Status</Label>
          <div className="flex flex-col gap-2">
            {["all", "pending", "completed"].map((status) => {
              const isActive = activeFilters.status === status;
              return (
                <Button
                  key={status}
                  onClick={() => onFilterChange?.("status", status)}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "justify-start",
                    isActive && "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Delete All Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onDeleteAll}
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Tasks
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
