"use client";

import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

/**
 * GlassButton Component
 * A glassmorphism button with gradient background and shimmer effect
 * Features: gradient styling, hover effects, loading state, disabled state
 */
export const GlassButton = forwardRef(({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const variants = {
    primary: 'glass-button text-white',
    secondary: 'glass-input text-gray-900 dark:text-white hover:bg-white/20',
    outline: 'border-2 border-neon-blue text-neon-blue hover:bg-neon-blue/10',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        px-6 py-3
        font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
});

GlassButton.displayName = 'GlassButton';

GlassButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
