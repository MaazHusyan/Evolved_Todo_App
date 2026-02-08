"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { GlassButton } from '@/components/ui/glass-button';

/**
 * ConfirmDialog Component
 * Glass-styled confirmation dialog for destructive actions
 * Features: backdrop blur, keyboard support (Enter/Escape), danger variant
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && !loading) onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="
                glass-card
                w-full max-w-md
                p-6
                relative
              "
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="
                  absolute top-4 right-4
                  p-1 rounded-full
                  text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-all duration-200
                "
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              {variant === 'danger' && (
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              )}

              {/* Title */}
              <h2
                id="dialog-title"
                className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2"
              >
                {title}
              </h2>

              {/* Message */}
              <p
                id="dialog-description"
                className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6"
              >
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <GlassButton
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  {cancelText}
                </GlassButton>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={`
                    flex-1 px-6 py-3 rounded-xl
                    font-medium
                    transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'glass-button text-white'
                    }
                  `}
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'primary']),
  loading: PropTypes.bool,
};
