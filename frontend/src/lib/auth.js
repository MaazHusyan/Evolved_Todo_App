import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

// Configure Better Auth to use backend API
// Frontend should NOT directly access the database
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
  ],
});
