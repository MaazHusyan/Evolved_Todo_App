"use client";

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/themeContext';

/**
 * GradientOrbs Component
 * Renders 3-5 large floating gradient orbs with smooth animations
 * Provides depth and visual interest to the background
 * Adapts colors and intensity based on theme
 */
export function GradientOrbs() {
  const { theme } = useTheme();

  // Enhanced gradients for dark mode with neon colors
  const orbs = [
    {
      id: 1,
      gradientLight: 'from-blue-400/20 to-purple-600/20',
      gradientDark: 'from-neon-blue/10 to-neon-purple/15',
      size: 'w-64 h-64',
      position: 'top-1/4 left-1/4',
      duration: 20,
      delay: 0,
    },
    {
      id: 2,
      gradientLight: 'from-green-400/20 to-cyan-600/20',
      gradientDark: 'from-neon-green/10 to-neon-blue/15',
      size: 'w-96 h-96',
      position: 'top-1/2 right-1/4',
      duration: 25,
      delay: 5,
    },
    {
      id: 3,
      gradientLight: 'from-pink-400/20 to-purple-600/20',
      gradientDark: 'from-neon-pink/10 to-neon-purple/15',
      size: 'w-80 h-80',
      position: 'bottom-1/4 left-1/3',
      duration: 22,
      delay: 10,
    },
    {
      id: 4,
      gradientLight: 'from-purple-400/20 to-blue-600/20',
      gradientDark: 'from-neon-purple/10 to-neon-blue/15',
      size: 'w-72 h-72',
      position: 'top-1/3 right-1/3',
      duration: 18,
      delay: 3,
    },
    {
      id: 5,
      gradientLight: 'from-cyan-400/20 to-green-600/20',
      gradientDark: 'from-neon-blue/10 to-neon-green/15',
      size: 'w-56 h-56',
      position: 'bottom-1/3 right-1/2',
      duration: 23,
      delay: 7,
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }} aria-hidden="true">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute ${orb.size} ${orb.position} rounded-full bg-gradient-to-r ${
            theme === 'dark' ? orb.gradientDark : orb.gradientLight
          } blur-3xl`}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
