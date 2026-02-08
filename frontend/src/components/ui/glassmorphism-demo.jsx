"use client";

import { motion } from "framer-motion";

export function GlassmorphismDemo() {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Glassmorphism Demo</h2>
      
      {/* Glass Card */}
      <motion.div
        className="glass dark:glass-dark p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
        <p className="text-muted-foreground">
          This is a glassmorphism card with backdrop blur and transparency effects.
        </p>
      </motion.div>

      {/* Animated Button */}
      <motion.button
        className="glass dark:glass-dark px-6 py-3 rounded-lg font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Animated Glass Button
      </motion.button>

      {/* Floating Elements */}
      <div className="relative h-32">
        <motion.div
          className="absolute w-16 h-16 glass dark:glass-dark rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-0 w-12 h-12 glass dark:glass-dark rounded-full"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
