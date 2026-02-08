import { useEffect, useRef, useState } from 'react';
import { getOptimizedConfig, isMobileDevice } from '@/lib/particle-config';

/**
 * Custom hook for managing particle animation system
 * @param {HTMLCanvasElement} canvasRef - Reference to canvas element
 * @returns {object} Particle system state and controls
 */
export function useParticles(canvasRef) {
  const [isActive, setIsActive] = useState(true);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const configRef = useRef(getOptimizedConfig(isMobileDevice()));

  // Particle class
  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      const config = configRef.current;
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.size = Math.random() * (config.size.max - config.size.min) + config.size.min;
      this.speedX = (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min;
      this.speedY = (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min;
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
      this.opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
    }

    update(mouse) {
      const config = configRef.current;

      // Mouse repulsion effect
      if (config.mouse.enabled && mouse) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.mouse.radius) {
          const force = (config.mouse.radius - distance) / config.mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * config.mouse.repulsionStrength * 0.1;
          this.y += Math.sin(angle) * force * config.mouse.repulsionStrength * 0.1;
        }
      }

      // Update position
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around edges
      if (this.x > this.canvas.width) this.x = 0;
      if (this.x < 0) this.x = this.canvas.width;
      if (this.y > this.canvas.height) this.y = 0;
      if (this.y < 0) this.y = this.canvas.height;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize particles
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const config = configRef.current;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    particlesRef.current = Array.from(
      { length: config.count },
      () => new Particle(canvas)
    );

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    if (config.mouse.enabled) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop
    const animate = () => {
      if (!isActive) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.update(config.mouse.enabled ? mouseRef.current : null);
        particle.draw(ctx);
      });

      // Draw connections
      if (config.connections.enabled) {
        drawConnections(ctx, particlesRef.current, config);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (config.mouse.enabled) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasRef, isActive]);

  // Draw connection lines between nearby particles
  function drawConnections(ctx, particles, config) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connections.distance) {
          const opacity = (1 - distance / config.connections.distance) * config.connections.opacity;
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = particles[i].color;
          ctx.lineWidth = config.connections.width;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  return {
    isActive,
    setIsActive,
    particleCount: particlesRef.current.length,
  };
}
