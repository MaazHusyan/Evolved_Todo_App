"use client";

import { useRef, useEffect } from 'react';
import { useParticles } from '@/hooks/useParticles';

/**
 * ParticleBackground Component
 * Renders an animated particle system on a canvas element
 * Features: 50 particles, mouse interaction, connection lines, performance optimized
 */
export function ParticleBackground() {
  const canvasRef = useRef(null);
  const { isActive, particleCount } = useParticles(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 4 }}
      aria-hidden="true"
    />
  );
}
