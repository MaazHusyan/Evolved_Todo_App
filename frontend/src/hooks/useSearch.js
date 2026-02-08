import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * useSearch Hook
 * Manages search state with debouncing for performance
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 * @returns {Object} Search state and handlers
 */
export function useSearch(delay = 300) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, delay);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
    clearSearch,
    isSearching: searchQuery !== debouncedQuery,
  };
}
