import { createAuthClient } from "better-auth/react";

// Token storage helpers
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bearer_token");
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("bearer_token", token);
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bearer_token");
  }
};

export const authClient = createAuthClient({
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getToken() || "",
    },
  },
});
