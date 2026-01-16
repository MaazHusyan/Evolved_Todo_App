"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function GlobalThemeToggle() {
  const pathname = usePathname();

  // Don't show the floating toggle on the dashboard since it has its own in the navbar
  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>
  );
}
