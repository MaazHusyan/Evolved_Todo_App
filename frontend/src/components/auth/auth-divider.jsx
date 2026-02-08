"use client";

import PropTypes from 'prop-types';

/**
 * AuthDivider Component
 * A divider with text for separating authentication methods
 */
export function AuthDivider({ text = 'or continue with' }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 text-gray-500 dark:text-gray-400 bg-transparent">
          {text}
        </span>
      </div>
    </div>
  );
}

AuthDivider.propTypes = {
  text: PropTypes.string,
};
