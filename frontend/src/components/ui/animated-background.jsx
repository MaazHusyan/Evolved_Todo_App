"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/themeContext";

export function AnimatedBackground() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main animated gradient background */}
      <div className={theme === 'dark' ? 'animated-bg-dark' : 'animated-bg'} />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-600/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-3/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-pink-400/20 to-yellow-600/20 blur-3xl"
        animate={{
          x: [0, -150, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-green-400/20 to-blue-600/20 blur-3xl"
        animate={{
          x: [0, 80, 0],
          y: [0, -80, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
