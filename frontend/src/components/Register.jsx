/**
 * Register component for user registration
 */
import React, { useState } from 'react';
import apiClient from '../services/apiClient';

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !username || !password) {
      setError('Email, username, and password are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = {
        email,
        username,
        password,
      };

      // Use apiClient's register method
      const response = await apiClient.register(userData);

      // Notify parent component
      if (onRegister) {
        onRegister(response);
      }
    } catch (err) {
      // Handle specific error messages from the backend
      if (err.message && err.message.includes('User with this email already exists')) {
        setError('A user with this email already exists. Please use a different email or try logging in.');
      } else if (err.message && err.message.includes('User with this username already exists')) {
        setError('A user with this username already exists. Please choose a different username.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <h2>Register</h2>
      {error && <div className="error">Error: {error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password (min 6 characters)"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-confirm-password">Confirm Password</label>
          <input
            id="reg-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;