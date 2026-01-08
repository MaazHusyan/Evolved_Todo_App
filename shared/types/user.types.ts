/**
 * User-related type definitions for the todo application
 */

export interface User {
  id: number;
  email: string;
  username?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  username?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
}