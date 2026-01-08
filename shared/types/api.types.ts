/**
 * API-related type definitions for the todo application
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface QueryParams extends PaginationParams {
  [key: string]: any;
}

export interface BaseFilter {
  limit?: number;
  offset?: number;
}

export interface ErrorResponse {
  detail: string;
}