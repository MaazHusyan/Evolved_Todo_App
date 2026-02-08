/**
 * Particle System Configuration
 * Configuration for the canvas-based particle background animation
 */

export const particleConfig = {
  // Number of particles to render
  count: 50,

  // Particle size range (in pixels)
  size: {
    min: 1,
    max: 3,
  },

  // Particle speed range
  speed: {
    min: 0.5,
    max: 2,
  },

  // Particle colors (neon accent colors)
  colors: ['#00d4ff', '#39ff14', '#ff0080', '#8b5cf6'],

  // Mouse interaction settings
  mouse: {
    // Enable mouse repulsion effect
    enabled: true,
    // Radius of mouse influence (in pixels)
    radius: 150,
    // Strength of repulsion force
    repulsionStrength: 50,
  },

  // Connection lines between nearby particles
  connections: {
    // Enable connection lines
    enabled: true,
    // Maximum distance for connections (in pixels)
    distance: 120,
    // Line opacity
    opacity: 0.2,
    // Line width
    width: 1,
  },

  // Performance settings
  performance: {
    // Reduce particle count on mobile
    mobileReduction: 0.5, // 50% of particles on mobile
    // FPS target
    targetFPS: 60,
    // Enable performance monitoring
    monitor: false,
  },

  // Animation settings
  animation: {
    // Enable smooth animations
    smooth: true,
    // Particle trail effect
    trail: false,
    // Trail length (if enabled)
    trailLength: 5,
  },
};

/**
 * Get optimized config based on device capabilities
 * @param {boolean} isMobile - Whether the device is mobile
 * @returns {object} Optimized particle configuration
 */
export function getOptimizedConfig(isMobile = false) {
  if (isMobile) {
    return {
      ...particleConfig,
      count: Math.floor(particleConfig.count * particleConfig.performance.mobileReduction),
      connections: {
        ...particleConfig.connections,
        enabled: false, // Disable connections on mobile for performance
      },
      mouse: {
        ...particleConfig.mouse,
        enabled: false, // Disable mouse interaction on mobile
      },
    };
  }

  return particleConfig;
}

/**
 * Detect if device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}
