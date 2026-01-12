/**
 * Authentication context for managing user authentication state
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Helper function to safely access localStorage
const getLocalStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

// Initial state - start with loading state to handle hydration properly
const initialState = {
  user: null,
  token: null, // Don't initialize with localStorage data here to prevent SSR mismatch
  isAuthenticated: false, // Will be determined after hydration
  loading: true, // Start with loading to indicate we're checking auth state
};

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'AUTH_CHECK_COMPLETE':
      // Used after hydration to set the actual auth state
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = (userData, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: userData, token },
    });
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    dispatch({ type: 'LOGOUT' });
  };

  // Set user (e.g., when token is already present)
  const setUser = (userData) => {
    dispatch({
      type: 'SET_USER',
      payload: userData,
    });
  };

  // Load user from localStorage after component mounts (hydration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getLocalStorageItem('authToken');
      const user = getLocalStorageItem('user');

      // Dispatch the auth check complete action to set the proper state
      dispatch({
        type: 'AUTH_CHECK_COMPLETE',
        payload: {
          token: token,
          user: user ? JSON.parse(user) : null,
          isAuthenticated: !!(token && user),
        }
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;