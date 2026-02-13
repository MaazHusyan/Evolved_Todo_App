// API service that calls Next.js API proxy routes
// The proxy handles authentication via JWT tokens

import { getToken } from "@/lib/auth-client";

class ApiService {
  async request(endpoint, options = {}, retries = 3, backoff = 500) {
    // Call the Next.js API proxy (same origin)
    const url = `/api${endpoint}`;

    // Get JWT token from localStorage
    const token = getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: "include", // Include cookies for session auth
    };

    try {
      const response = await fetch(url, config);

      // If successful, or if it's a client error (4xx) other than 429/408, return result
      // We don't retry 4xx errors usually, except 401 which we handle below, or rate limits
      if (response.ok) {
        if (response.status === 204) {
          return null;
        }
        return response.json();
      }

      // Handle 401 specifically - do not retry, just redirect
      if (response.status === 401) {
        console.warn("API Unauthorized (401) - Token might be invalid or expired.");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Unauthorized");
      }

      // For 5xx server errors or 429 (Too Many Requests), we might want to retry
      if (retries > 0 && (response.status >= 500 || response.status === 429)) {
        console.log(`Request failed with ${response.status}. Retrying in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.request(endpoint, options, retries - 1, backoff * 2);
      }

      // Parse error for other non-ok responses
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed: ${response.status}`);

    } catch (error) {
      // Network errors (fetch throws TypeError) should be retried
      if (retries > 0 && error.message !== "Unauthorized") {
        console.log(`Network error: ${error.message}. Retrying in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.request(endpoint, options, retries - 1, backoff * 2);
      }
      throw error;
    }
  }

  getTasks() {
    return this.request("/tasks");
  }

  createTask(task) {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  updateTask(taskId, updates) {
    return this.request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  toggleTaskCompletion(taskId, isCompleted) {
    return this.request(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ is_completed: isCompleted }),
    });
  }

  async deleteAllTasks(taskIds) {
    // Delete all tasks in parallel
    const deletePromises = taskIds.map(id => this.deleteTask(id));
    return Promise.all(deletePromises);
  }
}

export const api = new ApiService();
