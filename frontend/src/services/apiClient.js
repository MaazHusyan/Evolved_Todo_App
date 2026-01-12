/**
 * API client service for the Todo application
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @param {string} authToken - Authentication token
   * @returns {Promise} Response promise
   */
  async request(endpoint, options = {}, authToken = null) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(url, config);

      // Handle different response types
      if (response.status === 204) {
        // No content response
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || `HTTP error! status: ${response.status}`);
        }
        return data;
      } else {
        // Non-JSON response
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        }
        return text;
      }
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * Task-related API methods
   */

  // Get all tasks for a user
  async getTasks(userId, authToken) {
    return this.request(`/api/${userId}/tasks`, {}, authToken);
  }

  // Create a new task
  async createTask(userId, taskData, authToken) {
    return this.request(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    }, authToken);
  }

  // Get a specific task
  async getTask(userId, taskId, authToken) {
    return this.request(`/api/${userId}/tasks/${taskId}`, {}, authToken);
  }

  // Update a task
  async updateTask(userId, taskId, taskData, authToken) {
    return this.request(`/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }, authToken);
  }

  // Delete a task
  async deleteTask(userId, taskId, authToken) {
    return this.request(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    }, authToken);
  }

  // Update task completion status
  async updateTaskCompletion(userId, taskId, isCompleted, authToken) {
    return this.request(`/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    }, authToken);
  }

  /**
   * User-related API methods
   */

  // Register a new user
  async register(userData) {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Login user
  async login(credentials) {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Get user by ID
  async getUser(userId, authToken) {
    return this.request(`/api/users/${userId}`, {}, authToken);
  }
}

// Export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export for direct instantiation if needed
export { ApiClient };