"use client";

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { PREDEFINED_TAGS } from '@/data/tags';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FilterPanel Component
 * Comprehensive filter panel for tasks with glass styling
 * Features: status, priority, tags, date range, overdue filters
 */
export function FilterPanel({
  filters,
  onStatusChange,
  onPriorityToggle,
  onTagToggle,
  onDateRangeChange,
  onOverdueToggle,
  onClearAll,
  activeCount = 0,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);

  const priorities = [
    { value: 'high', label: 'High', color: 'text-red-600 dark:text-red-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'low', label: 'Low', color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          glass-input
          flex items-center gap-2
          px-4 py-2.5
          text-sm font-medium text-gray-700 dark:text-gray-300
          hover:bg-white/20 dark:hover:bg-black/20
          transition-all duration-200
          relative
        "
        aria-label="Open filters"
        aria-expanded={isOpen}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="
            absolute -top-2 -right-2
            w-5 h-5 rounded-full
            bg-neon-blue text-white
            text-xs font-bold
            flex items-center justify-center
          ">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="
                absolute right-0 mt-2 w-80
                glass-card
                p-4
                z-20
                max-h-[600px] overflow-y-auto
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {priorities.map((priority) => (
                    <label
                      key={priority.value}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priorities?.includes(priority.value)}
                        onChange={() => onPriorityToggle(priority.value)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-neon-blue focus:ring-neon-blue"
                      />
                      <span className={`text-sm ${priority.color} group-hover:opacity-80 transition-opacity`}>
                        {priority.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => onTagToggle(tag.name)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium
                        transition-all duration-200
                        ${filters.tags?.includes(tag.name)
                          ? `${tag.color} ring-2 ring-neon-blue`
                          : `${tag.color} opacity-60 hover:opacity-100`
                        }
                      `}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overdue Filter */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showOverdueOnly}
                    onChange={onOverdueToggle}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    Show overdue only
                  </span>
                </label>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange?.startDate || ''}
                    onChange={(e) => onDateRangeChange(e.target.value, filters.dateRange?.endDate)}
                    className="
                      glass-input
                      w-full px-3 py-2 text-sm
                      text-gray-900 dark:text-white
                    "
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={filters.dateRange?.endDate || ''}
                    onChange={(e) => onDateRangeChange(filters.dateRange?.startDate, e.target.value)}
                    className="
                      glass-input
                      w-full px-3 py-2 text-sm
                      text-gray-900 dark:text-white
                    "
                    placeholder="End date"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.string,
    priorities: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    dateRange: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }),
    showOverdueOnly: PropTypes.bool,
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onPriorityToggle: PropTypes.func.isRequired,
  onTagToggle: PropTypes.func.isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  onOverdueToggle: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  activeCount: PropTypes.number,
  className: PropTypes.string,
};
