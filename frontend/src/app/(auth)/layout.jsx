import { NoiseTexture } from "@/components/ui/noise-texture";
import { AnimatedGrid } from "@/components/ui/animated-grid";
import { GradientOrbs } from "@/components/ui/gradient-orbs";
import { ParticleBackground } from "@/components/ui/particle-background";

/**
 * Auth Layout
 * Provides background layers for authentication pages
 */
export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Background layers (same as root layout but scoped to auth pages) */}
      <NoiseTexture />
      <AnimatedGrid />
      <GradientOrbs />
      <ParticleBackground />

      {/* Auth content with higher z-index */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
