/**
 * Todo-related type definitions for the todo application
 */

export interface TodoItem {
  id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TodoCreateRequest {
  title: string;
  description?: string;
}

export interface TodoUpdateRequest {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

export interface TodoListResponse {
  items: TodoItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface TodoResponse {
  id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}