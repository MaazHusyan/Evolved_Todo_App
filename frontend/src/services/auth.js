/**
 * Authentication service for the todo application frontend.
 * Handles authentication operations and token management.
 */

import { API_ENDPOINTS, LOCAL_STORAGE_KEYS, HTTP_STATUS } from '../constants';

class AuthService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.status === HTTP_STATUS.CREATED) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Login user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise<Object>} Login result
   */
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok) {
        // Store tokens in localStorage
        if (result.access_token) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.access_token);

          // Set token expiry time (30 minutes as per backend)
          const now = new Date();
          const expiryTime = new Date(now.getTime() + 30 * 60000); // 30 minutes
          localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN + '_expiry', expiryTime.toISOString());
        }

        // Store user info
        if (result.user) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(result.user));
        }

        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      // Call the backend logout endpoint
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Clear stored tokens and user info
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN + '_expiry');
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message || 'Logout failed' };
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No token available' };
      }

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.ME}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Update stored user info
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(result.data));
        return { success: true, data: result.data };
      } else {
        // If unauthorized, clear stored tokens
        if (response.status === HTTP_STATUS.UNAUTHORIZED) {
          this.clearTokens();
        }
        return { success: false, error: result.detail || 'Failed to get user info' };
      }
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    const expiryStr = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN + '_expiry');
    if (expiryStr) {
      const expiry = new Date(expiryStr);
      const now = new Date();
      return now < expiry;
    }

    return !!token;
  }

  /**
   * Get stored access token
   * @returns {string|null} Access token or null
   */
  getToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored user info
   * @returns {Object|null} User object or null
   */
  getUser() {
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Clear all stored tokens
   */
  clearTokens() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN + '_expiry');
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }

  /**
   * Refresh token if expired
   * @returns {Promise<boolean>} Whether refresh was successful
   */
  async refreshToken() {
    // In a real implementation, this would call a refresh endpoint
    // For now, we'll just return false to indicate token needs renewal
    return false;
  }
}

// Export a singleton instance
export const authService = new AuthService();

export default authService;