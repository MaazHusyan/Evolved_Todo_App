/**
 * API service for the todo application frontend.
 * Handles API calls for todo operations.
 */

import { API_ENDPOINTS, LOCAL_STORAGE_KEYS, HTTP_STATUS } from '../constants';

class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Get authorization header with stored token
   * @returns {Object} Authorization header object
   */
  getAuthHeaders() {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all todos for the current user
   * @param {Object} params - Query parameters (limit, offset, completed)
   * @returns {Promise<Object>} Todos response
   */
  async getTodos(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.completed !== undefined) queryParams.append('completed', params.completed);

      const queryString = queryParams.toString();
      const url = `${this.baseURL}${API_ENDPOINTS.TODOS.BASE}${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Failed to get todos' };
      }
    } catch (error) {
      console.error('Get todos error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Create a new todo
   * @param {Object} todoData - Todo data (title, description)
   * @returns {Promise<Object>} Create response
   */
  async createTodo(todoData) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.TODOS.BASE}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(todoData),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Failed to create todo' };
      }
    } catch (error) {
      console.error('Create todo error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Get a specific todo by ID
   * @param {number} todoId - Todo ID
   * @returns {Promise<Object>} Todo response
   */
  async getTodo(todoId) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.TODOS.BY_ID(todoId)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Failed to get todo' };
      }
    } catch (error) {
      console.error('Get todo error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Update a specific todo
   * @param {number} todoId - Todo ID
   * @param {Object} todoData - Todo update data
   * @returns {Promise<Object>} Update response
   */
  async updateTodo(todoId, todoData) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.TODOS.BY_ID(todoId)}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(todoData),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Failed to update todo' };
      }
    } catch (error) {
      console.error('Update todo error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Partially update a specific todo
   * @param {number} todoId - Todo ID
   * @param {Object} todoData - Todo partial update data
   * @returns {Promise<Object>} Update response
   */
  async partialUpdateTodo(todoId, todoData) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.TODOS.BY_ID(todoId)}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(todoData),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Failed to update todo' };
      }
    } catch (error) {
      console.error('Partial update todo error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Delete a specific todo
   * @param {number} todoId - Todo ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteTodo(todoId) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.TODOS.BY_ID(todoId)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return { success: true, data: { message: 'Todo deleted successfully' } };
      } else {
        const result = await response.json();
        return { success: false, error: result.detail || 'Failed to delete todo' };
      }
    } catch (error) {
      console.error('Delete todo error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Toggle completion status of a specific todo
   * @param {number} todoId - Todo ID
   * @returns {Promise<Object>} Toggle response
   */
  async toggleTodoCompletion(todoId) {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.TODOS.BY_ID(todoId)}/toggle-complete`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.detail || 'Failed to toggle todo completion' };
      }
    } catch (error) {
      console.error('Toggle todo completion error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();

export default apiService;