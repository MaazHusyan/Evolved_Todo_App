import "./globals.css";
import { ThemeProvider } from "@/lib/themeContext";
import GlobalThemeToggle from "@/components/GlobalThemeToggle";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Evolve Todo App",
  description: "A modern full-stack todo application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-200`} suppressHydrationWarning>
        <ThemeProvider>
          <GlobalThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
