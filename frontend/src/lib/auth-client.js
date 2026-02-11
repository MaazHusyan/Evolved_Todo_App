import { createAuthClient } from "better-auth/react";

// Token storage helpers
export const getToken = () => {
  if (typeof window !== "undefined") {
    // Try multiple storage locations for Better Auth token
    const token = localStorage.getItem("bearer_token") || 
                  localStorage.getItem("better-auth.session.token") ||
                  localStorage.getItem("better-auth.token") ||
                  sessionStorage.getItem("better-auth.session.token");
    return token;
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("bearer_token", token);
    localStorage.setItem("better-auth.session.token", token);
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bearer_token");
    localStorage.removeItem("better-auth.session.token");
    localStorage.removeItem("better-auth.token");
    sessionStorage.removeItem("better-auth.session.token");
  }
};

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getToken() || "",
    },
  },
});
