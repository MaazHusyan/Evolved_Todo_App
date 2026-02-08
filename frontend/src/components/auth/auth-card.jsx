"use client";

import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * AuthCard Component
 * A centered glassmorphism card for authentication pages
 * Features: glass styling, entrance animation, responsive design
 */
export function AuthCard({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-6 sm:p-8 md:p-10">
          {/* Header */}
          {(title || subtitle) && (
            <div className="mb-6 sm:mb-8 text-center">
              {title && (
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          {children}
        </div>

        {/* Decorative glow effect */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-neon-blue rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-neon-purple rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}

AuthCard.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
