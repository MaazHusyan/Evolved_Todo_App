/**
 * Task Filtering Utilities
 * Functions for filtering tasks by various criteria
 */

/**
 * Filter tasks by search query
 * @param {Array} tasks - Array of task objects
 * @param {string} query - Search query string
 * @returns {Array} Filtered tasks
 */
export function filterBySearch(tasks, query) {
  if (!query || query.trim() === '') return tasks;

  const searchLower = query.toLowerCase().trim();

  return tasks.filter((task) => {
    const titleMatch = task.title?.toLowerCase().includes(searchLower);
    const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
    const tagsMatch = task.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

    return titleMatch || descriptionMatch || tagsMatch;
  });
}

/**
 * Filter tasks by completion status
 * @param {Array} tasks - Array of task objects
 * @param {string} status - Status filter ('all', 'active', 'completed')
 * @returns {Array} Filtered tasks
 */
export function filterByStatus(tasks, status) {
  if (status === 'all') return tasks;
  if (status === 'active') return tasks.filter((task) => !task.is_completed);
  if (status === 'completed') return tasks.filter((task) => task.is_completed);
  return tasks;
}

/**
 * Filter tasks by priority
 * @param {Array} tasks - Array of task objects
 * @param {Array} priorities - Array of priority strings ('low', 'medium', 'high')
 * @returns {Array} Filtered tasks
 */
export function filterByPriority(tasks, priorities) {
  if (!priorities || priorities.length === 0) return tasks;

  return tasks.filter((task) => {
    // If task has no priority, include it if 'none' is in priorities
    if (!task.priority) return priorities.includes('none');
    return priorities.includes(task.priority);
  });
}

/**
 * Filter tasks by tags
 * @param {Array} tasks - Array of task objects
 * @param {Array} selectedTags - Array of tag strings
 * @returns {Array} Filtered tasks
 */
export function filterByTags(tasks, selectedTags) {
  if (!selectedTags || selectedTags.length === 0) return tasks;

  return tasks.filter((task) => {
    if (!task.tags || task.tags.length === 0) return false;
    // Task must have at least one of the selected tags
    return selectedTags.some((tag) => task.tags.includes(tag));
  });
}

/**
 * Filter tasks by date range
 * @param {Array} tasks - Array of task objects
 * @param {Object} dateRange - Object with startDate and endDate
 * @returns {Array} Filtered tasks
 */
export function filterByDateRange(tasks, dateRange) {
  if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) return tasks;

  return tasks.filter((task) => {
    if (!task.due_date) return false;

    const dueDate = new Date(task.due_date);
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

    if (start && end) {
      return dueDate >= start && dueDate <= end;
    } else if (start) {
      return dueDate >= start;
    } else if (end) {
      return dueDate <= end;
    }

    return true;
  });
}

/**
 * Filter overdue tasks
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Overdue tasks
 */
export function filterOverdue(tasks) {
  const now = new Date();

  return tasks.filter((task) => {
    if (!task.due_date || task.is_completed) return false;
    const dueDate = new Date(task.due_date);
    return dueDate < now;
  });
}

/**
 * Apply all filters to tasks
 * @param {Array} tasks - Array of task objects
 * @param {Object} filters - Object containing all filter criteria
 * @returns {Array} Filtered tasks
 */
export function applyAllFilters(tasks, filters) {
  let filtered = tasks;

  // Apply search filter
  if (filters.search) {
    filtered = filterBySearch(filtered, filters.search);
  }

  // Apply status filter
  if (filters.status) {
    filtered = filterByStatus(filtered, filters.status);
  }

  // Apply priority filter
  if (filters.priorities && filters.priorities.length > 0) {
    filtered = filterByPriority(filtered, filters.priorities);
  }

  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filterByTags(filtered, filters.tags);
  }

  // Apply date range filter
  if (filters.dateRange) {
    filtered = filterByDateRange(filtered, filters.dateRange);
  }

  // Apply overdue filter
  if (filters.showOverdueOnly) {
    filtered = filterOverdue(filtered);
  }

  return filtered;
}

/**
 * Get active filter count
 * @param {Object} filters - Object containing all filter criteria
 * @returns {number} Number of active filters
 */
export function getActiveFilterCount(filters) {
  let count = 0;

  if (filters.search && filters.search.trim() !== '') count++;
  if (filters.status && filters.status !== 'all') count++;
  if (filters.priorities && filters.priorities.length > 0) count++;
  if (filters.tags && filters.tags.length > 0) count++;
  if (filters.dateRange && (filters.dateRange.startDate || filters.dateRange.endDate)) count++;
  if (filters.showOverdueOnly) count++;

  return count;
}
