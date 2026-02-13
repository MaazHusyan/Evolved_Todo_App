"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Plus, X } from "lucide-react";
import { PREDEFINED_TAGS } from "@/data/tags";
import { cn } from "@/lib/utils";

// Generate random light color for tags
const generateTagColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 20); // 60-80%
  const lightness = 75 + Math.floor(Math.random() * 15); // 75-90%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export function TaskForm({ initialData, onSubmit, onCancel, isLoading = false, className }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [dueDate, setDueDate] = useState(initialData?.due_date || "");
  const [priority, setPriority] = useState(initialData?.priority || "");
  const [selectedTags, setSelectedTags] = useState(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [tagColors, setTagColors] = useState({});
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Task title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      due_date: dueDate,
      priority: priority || null,
      tags: selectedTags,
    });
  };

  const toggleTag = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const addCustomTag = (tagName) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags((prev) => [...prev, trimmedTag]);
      // Generate color for new tag if it doesn't have one
      if (!tagColors[trimmedTag]) {
        setTagColors((prev) => ({
          ...prev,
          [trimmedTag]: generateTagColor(),
        }));
      }
      setTagInput("");
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag(tagInput);
    }
  };

  const removeTag = (tagName) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  const getTagColor = (tagName) => {
    // Check if it's a predefined tag
    const predefinedTag = PREDEFINED_TAGS.find((t) => t.name === tagName);
    if (predefinedTag) {
      return predefinedTag.color;
    }
    // Return custom color or generate new one
    if (!tagColors[tagName]) {
      const newColor = generateTagColor();
      setTagColors((prev) => ({ ...prev, [tagName]: newColor }));
      return newColor;
    }
    return tagColors[tagName];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="overflow-x-hidden"
    >
      <Card className={cn("w-full glass dark:glass-dark border-0 shadow-xl overflow-x-hidden", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Plus className="h-5 w-5" />
            {initialData?.title ? "Edit Task" : "Create New Task"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {initialData?.title
              ? "Update your task details below."
              : "Add a new task to your todo list."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 font-medium">Task Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={errors.title ? "border-red-500 text-gray-900 placeholder:text-gray-400" : "text-gray-900 placeholder:text-gray-400"}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300 font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-gray-700 dark:text-gray-300 font-medium">Start Date & Time</Label>
              <DateTimePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="Pick start date and time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date" className="text-gray-700 dark:text-gray-300 font-medium">Due Date & Time</Label>
              <DateTimePicker
                date={dueDate}
                setDate={setDueDate}
                placeholder="Pick due date and time"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-gray-700 dark:text-gray-300 font-medium">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority" className="text-gray-900">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low Priority</SelectItem>
                <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                <SelectItem value="high">🔴 High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label htmlFor="tag-input" className="text-gray-700 dark:text-gray-300 font-medium">Tags</Label>

            {/* Tag Input */}
            <div className="flex gap-2">
              <Input
                id="tag-input"
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 text-gray-900 placeholder:text-gray-400"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCustomTag(tagInput)}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                {selectedTags.map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <Badge
                      key={tag}
                      className="cursor-pointer transition-all hover:scale-105"
                      style={{
                        backgroundColor: color,
                        color: '#1a1a1a',
                        border: 'none',
                      }}
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Predefined Tags */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick tags:</p>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all hover:scale-105 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
                        isSelected && "opacity-50"
                      )}
                      onClick={() => !isSelected && toggleTag(tag.name)}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? (
                <>Processing...</>
              ) : initialData?.title ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
