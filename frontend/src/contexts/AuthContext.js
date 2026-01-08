/**
 * Authentication context for the todo application frontend.
 * Manages authentication state across the application.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

// Create the auth context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        if (authService.isAuthenticated()) {
          const result = await authService.getCurrentUser();
          if (result.success) {
            dispatch({ type: 'SET_USER', payload: result.data });
          } else {
            dispatch({ type: 'SET_USER', payload: null });
          }
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        dispatch({ type: 'SET_USER', payload: null });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await authService.login(credentials);
      if (result.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: result.data.user });
        return { success: true, data: result.data };
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Login failed' });
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await authService.register(userData);
      if (result.success) {
        // Automatically log in the user after successful registration
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        });

        if (loginResult.success) {
          return { success: true, data: loginResult.data };
        } else {
          return { success: false, error: loginResult.error };
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Registration failed' });
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Value to provide to consumers
  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;