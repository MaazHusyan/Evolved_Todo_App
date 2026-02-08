"use client";

import { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

/**
 * GlassInput Component
 * A glassmorphism-styled input with floating label animation
 * Features: floating labels, icon support, focus glow, password toggle, error states
 */
export const GlassInput = forwardRef(({
  label,
  type = 'text',
  icon: Icon,
  error,
  value,
  onChange,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;
  const hasValue = value && value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className={`relative ${className}`}>
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10">
            <Icon size={20} />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            glass-input
            w-full px-4 py-3.5
            ${Icon ? 'pl-14' : 'pl-4'}
            ${isPasswordType ? 'pr-12' : 'pr-4'}
            text-gray-900 dark:text-white
            placeholder-transparent
            transition-all duration-300
            ${error ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/30' : ''}
          `}
          aria-label={label}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={props.id}
          className={`
            absolute
            ${Icon ? 'left-14' : 'left-4'}
            transition-all duration-300 pointer-events-none
            ${isFloating
              ? 'top-0 -translate-y-1/2 text-xs bg-gray-900/50 dark:bg-gray-900/80 px-2 rounded'
              : 'top-1/2 -translate-y-1/2 text-base'
            }
            ${isFocused && !error ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'}
            ${error ? 'text-red-500' : ''}
          `}
        >
          {label}
        </label>

        {/* Password Toggle */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-2 text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

GlassInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'password', 'tel', 'url']),
  icon: PropTypes.elementType,
  error: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
};
