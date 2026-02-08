/**
 * Task Sorting Utilities
 * Functions for sorting tasks by various criteria
 */

/**
 * Sort tasks by creation date
 * @param {Array} tasks - Array of task objects
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted tasks
 */
export function sortByCreatedDate(tasks, order = 'desc') {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);

    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Sort tasks by due date
 * @param {Array} tasks - Array of task objects
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted tasks
 */
export function sortByDueDate(tasks, order = 'asc') {
  return [...tasks].sort((a, b) => {
    // Tasks without due dates go to the end
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;

    const dateA = new Date(a.due_date);
    const dateB = new Date(b.due_date);

    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Sort tasks by priority
 * @param {Array} tasks - Array of task objects
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted tasks
 */
export function sortByPriority(tasks, order = 'desc') {
  const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };

  return [...tasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 0;
    const priorityB = priorityOrder[b.priority] || 0;

    return order === 'asc' ? priorityA - priorityB : priorityB - priorityA;
  });
}

/**
 * Sort tasks by title (alphabetically)
 * @param {Array} tasks - Array of task objects
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted tasks
 */
export function sortByTitle(tasks, order = 'asc') {
  return [...tasks].sort((a, b) => {
    const titleA = (a.title || '').toLowerCase();
    const titleB = (b.title || '').toLowerCase();

    if (order === 'asc') {
      return titleA.localeCompare(titleB);
    } else {
      return titleB.localeCompare(titleA);
    }
  });
}

/**
 * Sort tasks by completion status
 * @param {Array} tasks - Array of task objects
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted tasks
 */
export function sortByStatus(tasks, order = 'asc') {
  return [...tasks].sort((a, b) => {
    const statusA = a.is_completed ? 1 : 0;
    const statusB = b.is_completed ? 1 : 0;

    return order === 'asc' ? statusA - statusB : statusB - statusA;
  });
}

/**
 * Apply sorting to tasks
 * @param {Array} tasks - Array of task objects
 * @param {string} sortBy - Sort criteria ('created', 'due', 'priority', 'title', 'status')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted tasks
 */
export function applySorting(tasks, sortBy, order = 'asc') {
  switch (sortBy) {
    case 'created':
      return sortByCreatedDate(tasks, order);
    case 'due':
      return sortByDueDate(tasks, order);
    case 'priority':
      return sortByPriority(tasks, order);
    case 'title':
      return sortByTitle(tasks, order);
    case 'status':
      return sortByStatus(tasks, order);
    default:
      return tasks;
  }
}

/**
 * Get sort options for dropdown
 * @returns {Array} Array of sort option objects
 */
export function getSortOptions() {
  return [
    { value: 'created-desc', label: 'Newest First', sortBy: 'created', order: 'desc' },
    { value: 'created-asc', label: 'Oldest First', sortBy: 'created', order: 'asc' },
    { value: 'due-asc', label: 'Due Date (Earliest)', sortBy: 'due', order: 'asc' },
    { value: 'due-desc', label: 'Due Date (Latest)', sortBy: 'due', order: 'desc' },
    { value: 'priority-desc', label: 'Priority (High to Low)', sortBy: 'priority', order: 'desc' },
    { value: 'priority-asc', label: 'Priority (Low to High)', sortBy: 'priority', order: 'asc' },
    { value: 'title-asc', label: 'Title (A-Z)', sortBy: 'title', order: 'asc' },
    { value: 'title-desc', label: 'Title (Z-A)', sortBy: 'title', order: 'desc' },
  ];
}
