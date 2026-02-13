"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { getToken, clearToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";
import { UserHeaderCard } from "@/components/dashboard/UserHeaderCard";
import { ControlSidebar } from "@/components/dashboard/ControlSidebar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TaskGrid } from "@/components/dashboard/TaskGrid";
import { TaskModal } from "@/components/dashboard/TaskModal";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    status: "all",
    priorities: [],
    tags: [],
  });
  const [summaryFilter, setSummaryFilter] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const router = useRouter();
  const { showCreated, showUpdated, showDeleted, showCompleted, showError } = useTaskNotifications();

  // Check authentication on mount
  useEffect(() => {
    const token = getToken();
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setIsAuthChecking(false);
    } catch (error) {
      console.error("Failed to parse user data", error);
      router.push("/login");
    }
  }, [router]);

  // Fetch tasks on mount
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      showError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on search, filters, and summary card selection
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply priority filters
    if (activeFilters.priorities.length > 0) {
      result = result.filter((task) => activeFilters.priorities.includes(task.priority));
    }

    // Apply tag filters
    if (activeFilters.tags.length > 0) {
      result = result.filter((task) =>
        task.tags?.some((tag) => activeFilters.tags.includes(tag))
      );
    }

    // Apply status filter from sidebar
    if (activeFilters.status === "pending") {
      result = result.filter((task) => !task.is_completed);
    } else if (activeFilters.status === "completed") {
      result = result.filter((task) => task.is_completed);
    }

    // Apply summary card filter
    if (summaryFilter === "pending") {
      result = result.filter((task) => !task.is_completed);
    } else if (summaryFilter === "completed") {
      result = result.filter((task) => task.is_completed);
    } else if (summaryFilter === "overdue") {
      result = result.filter((task) => {
        if (!task.due_date || task.is_completed) return false;
        return new Date(task.due_date) < new Date();
      });
    }

    // Sort by priority: urgent > high > medium > low
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 999;
      const bPriority = priorityOrder[b.priority] ?? 999;
      return aPriority - bPriority;
    });

    return result;
  }, [tasks, searchQuery, activeFilters, summaryFilter]);

  // Handlers
  const handleCreateTask = async (formData) => {
    setIsSubmitting(true);
    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        priority: formData.priority || null,
        tags: formData.tags || [],
      };
      const task = await api.createTask(taskData);
      setTasks([...tasks, task]);
      setShowTaskModal(false);
      showCreated(task.title);
    } catch (error) {
      console.error("Failed to create task", error);
      showError("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (formData) => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        priority: formData.priority || null,
        tags: formData.tags || [],
      };
      const updatedTask = await api.updateTask(editingTask.id, taskData);
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      setEditingTask(null);
      setShowTaskModal(false);
      showUpdated(updatedTask.title);
    } catch (error) {
      console.error("Failed to update task", error);
      showError("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await api.toggleTaskCompletion(task.id, !task.is_completed);
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      if (!task.is_completed) {
        showCompleted(updatedTask.title);
      }
    } catch (error) {
      console.error("Failed to update task", error);
      showError("Failed to update task");
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirmDialog({
      isOpen: true,
      action: "delete",
      data: taskId,
    });
  };

  const confirmDelete = async () => {
    try {
      await api.deleteTask(confirmDialog.data);
      setTasks(tasks.filter((t) => t.id !== confirmDialog.data));
      showDeleted();
      setConfirmDialog({ isOpen: false, action: null, data: null });
    } catch (error) {
      console.error("Failed to delete task", error);
      showError("Failed to delete task");
    }
  };

  const handleDeleteAll = () => {
    if (tasks.length === 0) {
      showError("No tasks to delete");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      action: "deleteAll",
      data: tasks.map((t) => t.id),
    });
  };

  const confirmDeleteAll = async () => {
    try {
      await api.deleteAllTasks(confirmDialog.data);
      setTasks([]);
      showDeleted();
      setConfirmDialog({ isOpen: false, action: null, data: null });
    } catch (error) {
      console.error("Failed to delete all tasks", error);
      showError("Failed to delete all tasks");
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === "priority") {
      setActiveFilters((prev) => ({
        ...prev,
        priorities: prev.priorities.includes(value)
          ? prev.priorities.filter((p) => p !== value)
          : [...prev.priorities, value],
      }));
    } else if (type === "tag") {
      setActiveFilters((prev) => ({
        ...prev,
        tags: prev.tags.includes(value)
          ? prev.tags.filter((t) => t !== value)
          : [...prev.tags, value],
      }));
    } else if (type === "status") {
      setActiveFilters((prev) => ({
        ...prev,
        status: value,
      }));
    }
  };

  const handleSummaryFilterClick = (filterId) => {
    setSummaryFilter(filterId === summaryFilter ? "all" : filterId);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleLogout = async () => {
    clearToken();
    localStorage.removeItem('user');
    router.push("/login");
  };

  if (isAuthChecking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4 glass dark:glass-dark p-8 rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200 p-3 sm:p-4 md:p-6">
      {/* Toast Notifications */}
      <Toaster />

      {/* Main Container */}
      <div className="max-w-[1920px] mx-auto space-y-4 sm:space-y-5 md:space-y-6">
        {/* User Header Card */}
        <UserHeaderCard
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }}
          onLogout={handleLogout}
          onCreateTask={() => setShowTaskModal(true)}
        />

        {/* Main Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 sm:gap-5 md:gap-6">
          {/* Left Sidebar - Hidden on mobile, shown in modal or as collapsible */}
          <div className="hidden lg:block">
            <ControlSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery("")}
              onDeleteAll={handleDeleteAll}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Mobile Filters - Collapsible section on mobile */}
          <div className="lg:hidden">
            <ControlSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery("")}
              onDeleteAll={handleDeleteAll}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content Area */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Summary Cards */}
            <SummaryCards
              tasks={tasks}
              activeFilter={summaryFilter}
              onFilterClick={handleSummaryFilterClick}
            />

            {/* Task Grid */}
            <TaskGrid
              tasks={filteredTasks}
              loading={loading}
              onToggle={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              emptyMessage={
                searchQuery || activeFilters.priorities.length > 0 || activeFilters.tags.length > 0 || summaryFilter !== "all"
                  ? "No tasks match your filters"
                  : "No tasks yet"
              }
            />
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask}
        isLoading={isSubmitting}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, data: null })}
        onConfirm={
          confirmDialog.action === "delete"
            ? confirmDelete
            : confirmDeleteAll
        }
        title={
          confirmDialog.action === "delete"
            ? "Delete Task?"
            : "Delete All Tasks?"
        }
        message={
          confirmDialog.action === "delete"
            ? "Are you sure you want to delete this task? This action cannot be undone."
            : `Are you sure you want to delete ALL ${confirmDialog.data?.length || 0} tasks? This action cannot be undone and will permanently remove all your tasks.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
