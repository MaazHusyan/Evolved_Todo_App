import "./globals.css";
import { ThemeProvider } from "@/lib/themeContext";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { AnimatedGrid } from "@/components/ui/animated-grid";
import { GradientOrbs } from "@/components/ui/gradient-orbs";
import { ParticleBackground } from "@/components/ui/particle-background";
import { Poppins } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkipLink } from "@/hooks/useAccessibility";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata = {
  title: "Evolve Todo App",
  description: "A modern full-stack todo application with glassmorphism design",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans min-h-screen bg-[var(--bg-primary)] text-foreground transition-colors duration-200`} suppressHydrationWarning>
        <ErrorBoundary>
          <SkipLink />
          <ThemeProvider>
            {/* Multi-layered background system with proper z-index hierarchy */}
            <NoiseTexture />
            <AnimatedGrid />
            <GradientOrbs />
            <ParticleBackground />

            {/* Main content with higher z-index */}
            <div id="main-content" className="relative" style={{ zIndex: 10 }}>
              {children}
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
