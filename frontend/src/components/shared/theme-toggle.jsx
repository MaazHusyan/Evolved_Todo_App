"use client";

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/themeContext';
import { motion } from 'framer-motion';

/**
 * ThemeToggle Component
 * Glassmorphic theme toggle button with smooth animations
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="glass-card p-3 w-11 h-11 flex items-center justify-center flex-shrink-0 transition-transform duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex items-center justify-center"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-neon-blue" />
        ) : (
          <Moon className="w-5 h-5 text-neon-purple" />
        )}
      </motion.div>
    </motion.button>
  );
}
