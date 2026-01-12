/**
 * Login page component
 */
import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import Login from '../components/Login';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (userData, token) => {
    login(userData, token);
    router.push('/dashboard'); // Redirect to dashboard after login
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Login</h1>
      <Login onLogin={handleLogin} />
      <div style={{ marginTop: '20px' }}>
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
}