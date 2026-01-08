/**
 * Shared constants for the todo application
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    BASE: '/api/auth',
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  TODOS: {
    BASE: '/api/todos',
    BY_ID: (id: number | string) => `/api/todos/${id}`,
  },
};

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'todo_app_access_token',
  REFRESH_TOKEN: 'todo_app_refresh_token',
  USER: 'todo_app_user',
};

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized: Please log in to access this resource',
  FORBIDDEN: 'Forbidden: You do not have permission to access this resource',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'An unexpected error occurred on the server',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

// User Roles
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// Todo Status
export enum TodoStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}