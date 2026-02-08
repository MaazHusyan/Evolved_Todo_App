"use client";

import { useEffect, useRef } from 'react';
import { useTheme } from '@/lib/themeContext';

/**
 * NoiseTexture Component
 * Renders a subtle film grain texture for added depth and premium feel
 * Adapts opacity and blend mode based on theme
 */
export function NoiseTexture() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;

    // Generate noise pattern
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;     // Red
      data[i + 1] = noise; // Green
      data[i + 2] = noise; // Blue
      data[i + 3] = theme === 'dark' ? 30 : 25; // Slightly more visible in dark mode
    }

    ctx.putImageData(imageData, 0, 0);
  }, [theme]);

  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-40"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          imageRendering: 'pixelated',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
