/**
 * Accessibility Hooks and Utilities
 *
 * Provides hooks and utilities for building accessible React components
 * following WCAG 2.1 AA guidelines.
 *
 * Features:
 * - Focus management
 * - Keyboard navigation
 * - ARIA utilities
 * - Screen reader announcements
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Focus Trap Hook
 *
 * Traps focus within a container (useful for modals, dialogs)
 *
 * @param isActive - Whether the focus trap is active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement?.focus();

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Keyboard Navigation Hook
 *
 * Handles keyboard navigation for lists and menus
 *
 * @param itemCount - Number of items in the list
 * @param onSelect - Callback when an item is selected
 * @returns Current index and keyboard event handler
 */
export function useKeyboardNavigation(itemCount, onSelect) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(itemCount - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(currentIndex);
        break;
      case 'Escape':
        e.preventDefault();
        // Let parent handle escape
        break;
    }
  }, [itemCount, currentIndex, onSelect]);

  return { currentIndex, handleKeyDown, setCurrentIndex };
}

/**
 * Screen Reader Announcement Hook
 *
 * Announces messages to screen readers using ARIA live regions
 *
 * @returns Function to announce messages
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message, priority = 'polite') => {
    setAnnouncement(''); // Clear first to ensure announcement
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  }, []);

  // Render live region
  useEffect(() => {
    const liveRegion = document.getElementById('sr-announcer');
    if (!liveRegion) {
      const div = document.createElement('div');
      div.id = 'sr-announcer';
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'true');
      div.className = 'sr-only';
      div.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(div);
    }

    const region = document.getElementById('sr-announcer');
    if (region && announcement) {
      region.textContent = announcement;
    }
  }, [announcement]);

  return announce;
}

/**
 * Focus Management Hook
 *
 * Manages focus restoration when components unmount
 *
 * @returns Ref to the element that should receive focus
 */
export function useFocusReturn() {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    // Store currently focused element
    previousFocusRef.current = document.activeElement;

    return () => {
      // Restore focus on unmount
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  return previousFocusRef;
}

/**
 * Keyboard Shortcuts Hook
 *
 * Registers global keyboard shortcuts
 *
 * @param shortcuts - Object mapping key combinations to handlers
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const modifiers = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        meta: e.metaKey,
      };

      // Build key combination string
      const combo = [
        modifiers.ctrl && 'ctrl',
        modifiers.alt && 'alt',
        modifiers.shift && 'shift',
        modifiers.meta && 'meta',
        key,
      ]
        .filter(Boolean)
        .join('+');

      // Check if handler exists for this combination
      const handler = shortcuts[combo];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

/**
 * ARIA Utilities
 */
export const aria = {
  /**
   * Generate unique ID for ARIA relationships
   */
  generateId: (prefix = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get ARIA props for a button
   */
  button: (label, options = {}) => ({
    role: 'button',
    'aria-label': label,
    tabIndex: options.disabled ? -1 : 0,
    'aria-disabled': options.disabled || undefined,
    'aria-pressed': options.pressed,
    'aria-expanded': options.expanded,
  }),

  /**
   * Get ARIA props for a dialog/modal
   */
  dialog: (labelId, descriptionId) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  }),

  /**
   * Get ARIA props for a combobox
   */
  combobox: (listboxId, expanded, activeDescendant) => ({
    role: 'combobox',
    'aria-expanded': expanded,
    'aria-controls': listboxId,
    'aria-activedescendant': activeDescendant,
    'aria-autocomplete': 'list',
  }),

  /**
   * Get ARIA props for a listbox
   */
  listbox: (label) => ({
    role: 'listbox',
    'aria-label': label,
  }),

  /**
   * Get ARIA props for a listbox option
   */
  option: (selected) => ({
    role: 'option',
    'aria-selected': selected,
  }),
};

/**
 * Skip Link Component
 *
 * Provides a skip link for keyboard users to bypass navigation
 */
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      {children}
    </a>
  );
}

/**
 * Visually Hidden Component
 *
 * Hides content visually but keeps it accessible to screen readers
 */
export function VisuallyHidden({ children, as: Component = 'span' }) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

/**
 * Check if element is focusable
 */
export function isFocusable(element) {
  if (!element) return false;

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableSelectors.some((selector) => element.matches(selector));
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container) {
  if (!container) return [];

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(selector));
}

export default {
  useFocusTrap,
  useKeyboardNavigation,
  useScreenReaderAnnouncement,
  useFocusReturn,
  useKeyboardShortcuts,
  aria,
  SkipLink,
  VisuallyHidden,
  isFocusable,
  getFocusableElements,
};
