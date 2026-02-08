import { useState, useEffect } from 'react';

/**
 * useFilters Hook
 * Manages filter state for tasks
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and handlers
 */
export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    status: initialFilters.status || 'all',
    priorities: initialFilters.priorities || [],
    tags: initialFilters.tags || [],
    dateRange: initialFilters.dateRange || { startDate: null, endDate: null },
    showOverdueOnly: initialFilters.showOverdueOnly || false,
  });

  // Update status filter
  const setStatusFilter = (status) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  // Toggle priority filter
  const togglePriority = (priority) => {
    setFilters((prev) => {
      const priorities = prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority];
      return { ...prev, priorities };
    });
  };

  // Toggle tag filter
  const toggleTag = (tag) => {
    setFilters((prev) => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  // Set date range filter
  const setDateRange = (startDate, endDate) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
  };

  // Toggle overdue filter
  const toggleOverdueFilter = () => {
    setFilters((prev) => ({
      ...prev,
      showOverdueOnly: !prev.showOverdueOnly,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      priorities: [],
      tags: [],
      dateRange: { startDate: null, endDate: null },
      showOverdueOnly: false,
    });
  };

  // Remove specific filter
  const removeFilter = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter('all');
        break;
      case 'priority':
        togglePriority(value);
        break;
      case 'tag':
        toggleTag(value);
        break;
      case 'dateRange':
        setDateRange(null, null);
        break;
      case 'overdue':
        toggleOverdueFilter();
        break;
      default:
        break;
    }
  };

  // Get active filters count
  const getActiveCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.priorities.length > 0) count += filters.priorities.length;
    if (filters.tags.length > 0) count += filters.tags.length;
    if (filters.dateRange.startDate || filters.dateRange.endDate) count++;
    if (filters.showOverdueOnly) count++;
    return count;
  };

  // Persist filters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('taskFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }, [filters]);

  return {
    filters,
    setStatusFilter,
    togglePriority,
    toggleTag,
    setDateRange,
    toggleOverdueFilter,
    clearAllFilters,
    removeFilter,
    activeFilterCount: getActiveCount(),
  };
}
