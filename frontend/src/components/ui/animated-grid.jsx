"use client";

import { useTheme } from '@/lib/themeContext';

/**
 * AnimatedGrid Component
 * Renders a subtle animated grid overlay for depth and structure
 * Adapts colors based on theme
 */
export function AnimatedGrid() {
  const { theme } = useTheme();

  const gridColor = theme === 'dark'
    ? 'rgba(0, 212, 255, 0.08)' // Neon blue for dark mode
    : 'rgba(139, 92, 246, 0.05)'; // Purple for light mode

  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-30"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
}
