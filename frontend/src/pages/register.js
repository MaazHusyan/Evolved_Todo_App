/**
 * Register page component
 */
import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import Register from '../components/Register';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth(); // We'll use login to store user data after registration

  const handleRegister = (userData) => {
    // After successful registration, we might want to auto-login
    // Or redirect to login page
    router.push('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Register</h1>
      <Register onRegister={handleRegister} />
      <div style={{ marginTop: '20px' }}>
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
}