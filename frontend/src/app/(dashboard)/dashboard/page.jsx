"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { authClient, clearToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const resetNewTaskForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskPriority("");
    setShowAddForm(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const taskData = {
        title: newTaskTitle,
        description: newTaskDescription || null,
        start_date: newTaskStartDate ? new Date(newTaskStartDate).toISOString() : null,
        due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
        priority: newTaskPriority || null,
      };
      const task = await api.createTask(taskData);
      setTasks([...tasks, task]);
      resetNewTaskForm();
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const taskData = {
        title: editingTask.title,
        description: editingTask.description || null,
        start_date: editingTask.start_date ? new Date(editingTask.start_date).toISOString() : null,
        due_date: editingTask.due_date ? new Date(editingTask.due_date).toISOString() : null,
        priority: editingTask.priority || null,
        is_completed: editingTask.is_completed,
      };
      const updatedTask = await api.updateTask(editingTask.id, taskData);
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await api.toggleTaskCompletion(task.id, !task.is_completed);
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleLogout = async () => {
    clearToken();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 ring-red-600/20";
      case "medium":
        return "bg-yellow-100 text-yellow-700 ring-yellow-600/20";
      case "low":
        return "bg-green-100 text-green-700 ring-green-600/20";
      default:
        return "bg-gray-100 text-gray-700 ring-gray-600/20";
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Evolve Todo</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{session.user.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-150"
              >
                Sign out
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Add Task Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add a new task
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
            >
              {showAddForm ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Simple mode
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Advanced mode
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg sm:rounded-l-lg sm:rounded-r-none border-0 py-3 pl-11 pr-4 text-gray-900 dark:text-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-l-none sm:rounded-r-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>

            {showAddForm && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                      placeholder="Add more details about your task..."
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      className="block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                      value={newTaskStartDate}
                      onChange={(e) => setNewTaskStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      className="block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Priority
                    </label>
                    <select
                      className="block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                    >
                      <option value="">Select priority...</option>
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-700 sm:rounded-xl transition-colors duration-200">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Your Tasks</h3>
              <div className="flex gap-2">
                <span className="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-900/30 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-400 ring-1 ring-inset ring-primary-700/10 dark:ring-primary-400/20">
                  {tasks.filter((t) => !t.is_completed).length} pending
                </span>
                <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-700/10 dark:ring-green-400/20">
                  {tasks.filter((t) => t.is_completed).length} completed
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary-600"></div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 px-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new task above.</p>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.map((task) => (
                <li key={task.id} className="group px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:px-6 transition duration-150">
                  <div className="flex items-start justify-between gap-x-4">
                    <div className="flex min-w-0 gap-x-4">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 ring-1 ring-gray-200 dark:ring-gray-600">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          onChange={() => handleToggleComplete(task)}
                          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
                        />
                      </div>
                      <div className="min-w-0 flex-auto">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold leading-6 ${task.is_completed ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-white"}`}>
                            {task.title}
                          </p>
                          {task.priority && (
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                          {isOverdue(task.due_date) && !task.is_completed && (
                            <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/20">
                              Overdue
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          {task.start_date && (
                            <span className="flex items-center gap-1">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Start: {formatDate(task.start_date)}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${isOverdue(task.due_date) && !task.is_completed ? "text-red-600 dark:text-red-400 font-medium" : ""}`}>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Due: {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-x-2">
                      <button
                        onClick={() => setEditingTask({ ...task, start_date: formatDateForInput(task.start_date), due_date: formatDateForInput(task.due_date) })}
                        className="hidden rounded-md bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-primary-50 dark:hover:bg-gray-600 hover:text-primary-600 hover:ring-primary-200 group-hover:block transition duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(task.id)}
                        className="hidden rounded-md bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 hover:ring-red-200 group-hover:block transition duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/75 dark:bg-gray-900/90 backdrop-blur-sm transition-opacity" onClick={() => setEditingTask(null)} />
            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-6 pb-6 pt-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleUpdateTask}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Task
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="rounded-lg p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                      placeholder="Add more details..."
                      value={editingTask.description || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                        value={editingTask.start_date || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                        value={editingTask.due_date || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Priority
                      </label>
                      <select
                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                        value={editingTask.priority || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                      >
                        <option value="">Select priority...</option>
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status
                      </label>
                      <select
                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 shadow-sm"
                        value={editingTask.is_completed ? "completed" : "pending"}
                        onChange={(e) => setEditingTask({ ...editingTask, is_completed: e.target.value === "completed" })}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="rounded-lg bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/75 dark:bg-gray-900/90 backdrop-blur-sm transition-opacity" onClick={() => setDeleteConfirm(null)} />
            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-6 pb-6 pt-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-200 dark:border-gray-700">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-12 sm:w-12">
                  <svg className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                  <h3 className="text-lg font-bold leading-6 text-gray-900 dark:text-white">Delete task</h3>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to delete this task? This action cannot be undone and all task data will be permanently removed.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(deleteConfirm)}
                  className="inline-flex w-full justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:w-auto transition-all duration-200"
                >
                  Delete Task
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
