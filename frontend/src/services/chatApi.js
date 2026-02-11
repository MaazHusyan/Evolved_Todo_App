/**
 * Chat API service for AI assistant interaction
 * Compatible with OpenAI ChatKit
 */

import { getToken } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Get authorization token from Better Auth session
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;

  // Use the centralized token getter from auth-client
  const token = getToken();
  if (token) return token;

  // Fallback: Try multiple storage locations for Better Auth token
  const sessionToken = localStorage.getItem("better-auth.session.token");
  if (sessionToken) return sessionToken;

  const authToken = localStorage.getItem("auth_token");
  if (authToken) return authToken;

  const bearerToken = localStorage.getItem("bearer_token");
  if (bearerToken) return bearerToken;

  return null;
}

/**
 * Get user ID from localStorage
 */
export function getUserId() {
  if (typeof window === "undefined") return null;
  
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user.user_id || user.sub;
    }
  } catch (e) {
    console.error("Failed to parse user data:", e);
  }
  
  return null;
}

/**
 * Send a message to the AI assistant
 * @param {string} message - User message
 * @returns {Promise<Object>} Assistant response
 */
export async function sendMessage(message) {
  const token = getAuthToken();
  const userId = getUserId();
  
  if (!token || !userId) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
    body: JSON.stringify({ message, stream: false }),
  });

  if (!response.ok) {
    // Try to get error message from response
    let errorMessage = "Failed to send message";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // If parsing fails, use status-based message
    }
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    if (response.status === 503) {
      throw new Error("AI service is busy. Please wait a moment and try again.");
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Send a message with streaming response
 * @param {string} message - User message
 * @param {Function} onToken - Callback for each token received
 * @returns {Promise<void>}
 */
export async function sendMessageStream(message, onToken) {
  const token = getAuthToken();
  const userId = getUserId();
  
  if (!token || !userId) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/message/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
    body: JSON.stringify({ message, stream: true }),
  });

  if (!response.ok) {
    // Try to get error message from response
    let errorMessage = "Failed to send message";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // If parsing fails, use status-based message
    }
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    if (response.status === 503) {
      throw new Error("AI service is busy. Please wait a moment and try again.");
    }
    throw new Error(errorMessage);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          if (data.startsWith("[ERROR]")) {
            throw new Error(data.slice(8));
          }
          onToken(data);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Get chat history
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Array>} Message history
 */
export async function getChatHistory(limit = 50) {
  const token = getAuthToken();
  const userId = getUserId();
  
  if (!token || !userId) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/chat/history?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    throw new Error("Failed to fetch chat history");
  }

  return response.json();
}

/**
 * Clear all chat messages
 * @returns {Promise<Object>} Response from server
 */
export async function clearChat() {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Use Next.js API proxy route instead of direct backend call
  const response = await fetch(`/api/chat/clear`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    throw new Error("Failed to clear chat");
  }

  return response.json();
}
