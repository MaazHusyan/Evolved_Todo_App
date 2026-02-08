"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Tag, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { GlassButton } from '@/components/ui/glass-button';

/**
 * BulkActionBar Component
 * Floating action bar for bulk operations on selected tasks
 * Features: glass styling, smooth animations, confirmation prompts
 */
export function BulkActionBar({
  selectedCount,
  onBulkComplete,
  onBulkDelete,
  onBulkTag,
  onDeselectAll,
  className = ""
}) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed bottom-6 left-1/2 -translate-x-1/2
          glass-card
          px-6 py-4
          flex items-center gap-4
          shadow-2xl
          z-50
          ${className}
        `}
      >
        {/* Selection Count */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-neon-blue flex items-center justify-center">
            <span className="text-xs font-bold text-white">{selectedCount}</span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedCount} selected
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mark Complete */}
          <button
            type="button"
            onClick={onBulkComplete}
            className="
              flex items-center gap-2 px-4 py-2
              text-sm font-medium
              text-gray-700 dark:text-gray-300
              hover:text-neon-green
              hover:bg-white/10 dark:hover:bg-black/10
              rounded-lg
              transition-all duration-200
            "
            aria-label="Mark selected tasks as complete"
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Complete</span>
          </button>

          {/* Add Tags */}
          <button
            type="button"
            onClick={onBulkTag}
            className="
              flex items-center gap-2 px-4 py-2
              text-sm font-medium
              text-gray-700 dark:text-gray-300
              hover:text-neon-purple
              hover:bg-white/10 dark:hover:bg-black/10
              rounded-lg
              transition-all duration-200
            "
            aria-label="Add tags to selected tasks"
          >
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Tag</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onBulkDelete}
            className="
              flex items-center gap-2 px-4 py-2
              text-sm font-medium
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              rounded-lg
              transition-all duration-200
            "
            aria-label="Delete selected tasks"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />

        {/* Deselect All */}
        <button
          type="button"
          onClick={onDeselectAll}
          className="
            p-2 rounded-full
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-200
          "
          aria-label="Deselect all tasks"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

BulkActionBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onBulkComplete: PropTypes.func.isRequired,
  onBulkDelete: PropTypes.func.isRequired,
  onBulkTag: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  className: PropTypes.string,
};
