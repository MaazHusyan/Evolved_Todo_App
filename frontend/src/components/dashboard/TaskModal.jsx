"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREDEFINED_TAGS } from "@/data/tags";

export function TaskModal({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize form with existing data when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setStartDate(initialData.start_date || "");
      setDueDate(initialData.due_date || "");
      setPriority(initialData.priority || "");
      setSelectedTags(initialData.tags || []);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setDueDate("");
    setPriority("");
    setSelectedTags([]);
    setTagInput("");
    setErrors({});
  };

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

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const toggleTag = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const addCustomTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags((prev) => [...prev, trimmedTag]);
      setTagInput("");
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  const removeTag = (tagName) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "urgent", label: "Urgent", color: "bg-red-500" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              <div className="glass dark:glass-dark rounded-xl sm:rounded-2xl shadow-2xl border-0">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {initialData ? "Edit Task" : "Create New Task"}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {initialData
                        ? "Update your task details below"
                        : "Fill in the details to create a new task"}
                    </p>
                  </div>
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="icon"
                    disabled={isLoading}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Title */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base font-semibold">
                      Task Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="What needs to be done?"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                      }}
                      className={cn("glass-input text-sm sm:text-base", errors.title && "border-red-500")}
                      disabled={isLoading}
                    />
                    {errors.title && (
                      <p className="text-xs sm:text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="description" className="text-sm sm:text-base font-semibold">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add more details about your task..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="glass-input text-sm sm:text-base resize-none"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm sm:text-base font-semibold">Start Date & Time</Label>
                      <DateTimePicker
                        date={startDate}
                        setDate={setStartDate}
                        placeholder="Pick start date"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm sm:text-base font-semibold">Due Date & Time</Label>
                      <DateTimePicker
                        date={dueDate}
                        setDate={setDueDate}
                        placeholder="Pick due date"
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-sm sm:text-base font-semibold">Priority</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {priorities.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          disabled={isLoading}
                          className={cn(
                            "p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl border-2 transition-all font-medium text-xs sm:text-sm",
                            "hover:scale-105 active:scale-95",
                            priority === p.value
                              ? "border-blue-600 bg-blue-600/10 text-blue-700 dark:text-blue-300"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          )}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full", p.color)} />
                            <span className="truncate">{p.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-sm sm:text-base font-semibold">Tags</Label>

                    {/* Custom Tag Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a tag and press Enter..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        className="glass-input flex-1 text-sm"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        onClick={addCustomTag}
                        disabled={!tagInput.trim() || isLoading}
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                        {selectedTags.map((tag) => (
                          <Badge
                            key={tag}
                            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                            onClick={() => !isLoading && removeTag(tag)}
                          >
                            {tag}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Quick Tags */}
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                        Quick tags:
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {PREDEFINED_TAGS.map((tag) => {
                          const isSelected = selectedTags.includes(tag.name);
                          return (
                            <Badge
                              key={tag.id}
                              onClick={() => !isLoading && toggleTag(tag.name)}
                              className={cn(
                                "cursor-pointer transition-all hover:scale-105 text-xs px-2 py-1",
                                isSelected && "opacity-50"
                              )}
                            >
                              {tag.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !title.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Processing...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : initialData ? (
                        <>
                          <span className="hidden sm:inline">Save Changes</span>
                          <span className="sm:hidden">Save</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Create Task</span>
                          <span className="sm:hidden">Create</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
