"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { getSortOptions } from '@/lib/task-sorting';

/**
 * SortDropdown Component
 * Dropdown for selecting task sort order
 * Features: glass styling, persists to localStorage
 */
export function SortDropdown({ value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const sortOptions = getSortOptions();
  const selectedOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  const handleSelect = (option) => {
    onChange(option.value, option.sortBy, option.order);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          glass-input
          flex items-center justify-between gap-2
          px-4 py-2.5
          text-sm font-medium text-gray-700 dark:text-gray-300
          hover:bg-white/20 dark:hover:bg-black/20
          transition-all duration-200
          min-w-[200px]
        "
        aria-label="Sort tasks"
        aria-expanded={isOpen}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="
            absolute right-0 mt-2 w-64
            glass-card
            py-2
            z-20
            max-h-96 overflow-y-auto
          ">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  transition-colors duration-150
                  ${value === option.value
                    ? 'bg-neon-blue/10 text-neon-blue font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

SortDropdown.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
