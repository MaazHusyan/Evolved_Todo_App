import { useState, useCallback } from 'react';

/**
 * useBulkSelection Hook
 * Manages bulk selection state for tasks
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Selection state and handlers
 */
export function useBulkSelection(tasks = []) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toggle selection for a single task
  const toggleSelection = useCallback((taskId) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // Select all tasks
  const selectAll = useCallback(() => {
    const allIds = new Set(tasks.map((task) => task.id));
    setSelectedIds(allIds);
  }, [tasks]);

  // Deselect all tasks
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === tasks.length && tasks.length > 0) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, tasks.length, selectAll, deselectAll]);

  // Check if a task is selected
  const isSelected = useCallback(
    (taskId) => {
      return selectedIds.has(taskId);
    },
    [selectedIds]
  );

  // Check if all tasks are selected
  const isAllSelected = tasks.length > 0 && selectedIds.size === tasks.length;

  // Check if some (but not all) tasks are selected
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < tasks.length;

  // Get selected tasks
  const getSelectedTasks = useCallback(() => {
    return tasks.filter((task) => selectedIds.has(task.id));
  }, [tasks, selectedIds]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
    getSelectedTasks,
  };
}
