/**
 * Todo context for the todo application frontend.
 * Manages todo state across the application.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { apiService } from '../services/api';

// Create the todo context
const TodoContext = createContext();

// Initial state
const initialState = {
  todos: [],
  isLoading: false,
  error: null,
  selectedTodo: null,
};

// Reducer function
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_TODOS':
      return {
        ...state,
        todos: action.payload,
        isLoading: false,
        error: null,
      };
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        ),
        selectedTodo: action.payload,
        isLoading: false,
        error: null,
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
        isLoading: false,
        error: null,
      };
    case 'SET_SELECTED_TODO':
      return {
        ...state,
        selectedTodo: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// TodoProvider component
export const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Fetch todos for the current user
  const fetchTodos = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await apiService.getTodos(params);
      if (result.success) {
        dispatch({ type: 'SET_TODOS', payload: result.data.data.items || [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch todos' });
    }
  }, []);

  // Create a new todo
  const createTodo = useCallback(async (todoData) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await apiService.createTodo(todoData);
      if (result.success) {
        dispatch({ type: 'ADD_TODO', payload: result.data.data });
        return { success: true, data: result.data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to create todo' });
      return { success: false, error: error.message };
    }
  }, []);

  // Update a todo
  const updateTodo = useCallback(async (todoId, todoData) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await apiService.updateTodo(todoId, todoData);
      if (result.success) {
        dispatch({ type: 'UPDATE_TODO', payload: result.data.data });
        return { success: true, data: result.data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update todo' });
      return { success: false, error: error.message };
    }
  }, []);

  // Delete a todo
  const deleteTodo = useCallback(async (todoId) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await apiService.deleteTodo(todoId);
      if (result.success) {
        dispatch({ type: 'DELETE_TODO', payload: todoId });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to delete todo' });
      return { success: false, error: error.message };
    }
  }, []);

  // Toggle todo completion
  const toggleTodoCompletion = useCallback(async (todoId) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await apiService.toggleTodoCompletion(todoId);
      if (result.success) {
        dispatch({ type: 'UPDATE_TODO', payload: result.data.data });
        return { success: true, data: result.data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to toggle todo' });
      return { success: false, error: error.message };
    }
  }, []);

  // Get a single todo
  const getTodo = useCallback(async (todoId) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await apiService.getTodo(todoId);
      if (result.success) {
        dispatch({ type: 'SET_SELECTED_TODO', payload: result.data.data });
        return { success: true, data: result.data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to get todo' });
      return { success: false, error: error.message };
    }
  }, []);

  // Value to provide to consumers
  const value = {
    todos: state.todos,
    isLoading: state.isLoading,
    error: state.error,
    selectedTodo: state.selectedTodo,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion,
    getTodo,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

// Hook to use the todo context
export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

export default TodoContext;