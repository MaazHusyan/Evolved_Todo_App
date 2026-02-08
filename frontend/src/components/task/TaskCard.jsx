"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, Calendar } from "lucide-react";
import { formatDate, getPriorityColor, isOverdue } from "@/lib/utils";
import { PREDEFINED_TAGS } from "@/data/tags";

// Generate consistent color based on tag name
const getTagColor = (tagName) => {
  // Check if it's a predefined tag
  const predefinedTag = PREDEFINED_TAGS.find((t) => t.name === tagName);
  if (predefinedTag) {
    return predefinedTag.color;
  }

  // Generate consistent color from tag name using hash
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 15); // 65-80%
  const lightness = 75 + (Math.abs(hash >> 8) % 15); // 75-90%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Get priority colors with proper contrast
const getPriorityStyle = (priority) => {
  const styles = {
    high: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#dc2626',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    medium: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      color: '#d97706',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    low: {
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      color: '#16a34a',
      borderColor: 'rgba(34, 197, 94, 0.3)',
    },
  };
  return styles[priority] || styles.low;
};

// Get priority border colors
const getPriorityBorderColor = (priority) => {
  const colors = {
    urgent: "border-l-4 border-l-red-600 dark:border-l-red-500",
    high: "border-l-4 border-l-orange-600 dark:border-l-orange-500",
    medium: "border-l-4 border-l-yellow-600 dark:border-l-yellow-500",
    low: "border-l-4 border-l-green-600 dark:border-l-green-500",
  };
  return colors[priority] || "";
};

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  className,
  // Bulk selection props
  isSelectable = false,
  isSelected = false,
  onSelect = null,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "glass dark:glass-dark transition-all duration-300 hover:shadow-xl border-0",
          task.is_completed && "opacity-60",
          isSelected && "ring-2 ring-neon-blue",
          getPriorityBorderColor(task.priority),
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Bulk Selection Checkbox */}
          {isSelectable && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect && onSelect(task.id)}
              className="mt-1.5"
              aria-label="Select task for bulk actions"
            />
          )}

          {/* Completion Checkbox */}
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={() => onToggle(task)}
            className="mt-1.5"
            aria-label="Mark task as complete"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <h3
              className={cn(
                "text-lg font-semibold leading-tight",
                task.is_completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 flex-shrink-0",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tags Section */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag, index) => {
              const tagColor = getTagColor(tag);
              const isPredefined = PREDEFINED_TAGS.find((t) => t.name === tag);

              return (
                <Badge
                  key={index}
                  className={cn("text-sm font-medium border-0 px-3 py-1", isPredefined && tagColor)}
                  style={!isPredefined ? {
                    backgroundColor: tagColor,
                    color: '#1a1a1a',
                  } : undefined}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Priority and Status Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Badge */}
          {task.priority && (
            <Badge
              className="border font-medium text-sm px-3 py-1"
              style={getPriorityStyle(task.priority)}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
          )}

          {/* Overdue Badge */}
          {isOverdue(task.due_date) && !task.is_completed && (
            <Badge variant="destructive" className="animate-pulse text-sm px-3 py-1 font-medium">
              Overdue
            </Badge>
          )}
        </div>

        {/* Dates Section */}
        {(task.start_date || task.due_date) && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            {task.start_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Start:</span>
                <span>{formatDate(task.start_date)}</span>
              </div>
            )}
            {task.due_date && (
              <div
                className={cn(
                  "flex items-center gap-2 text-sm",
                  isOverdue(task.due_date) && !task.is_completed
                    ? "text-red-600 dark:text-red-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Due:</span>
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}
