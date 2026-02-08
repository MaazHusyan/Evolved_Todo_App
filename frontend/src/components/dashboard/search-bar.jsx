"use client";

import { Search, X, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * SearchBar Component
 * Glass-styled search input with live filtering and keyboard shortcuts
 * Features: debounced search, clear button, loading indicator, keyboard shortcut (Ctrl+K)
 */
export function SearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
  placeholder = "Search tasks...",
  className = ""
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
        {isSearching ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          glass-input
          w-full pl-12 pr-24 py-3
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          transition-all duration-300
        "
        aria-label="Search tasks"
      />

      {/* Keyboard Shortcut Hint */}
      {!value && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
            Ctrl
          </kbd>
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
            K
          </kbd>
        </div>
      )}

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            p-1 rounded-full
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-200
          "
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isSearching: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};
