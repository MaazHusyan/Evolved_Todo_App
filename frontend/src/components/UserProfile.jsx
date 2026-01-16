/**
 * UserProfile component for displaying user information
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import apiClient from '../services/apiClient';

const UserProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [user, token]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      // Use the user ID from the auth context
      if (user && user.id) {
        const response = await apiClient.request(`/api/users/${user.id}`, {}, token);
        setProfile(response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading user profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-details">
        <p><strong>ID:</strong> {profile.id}</p>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Active:</strong> {profile.is_active ? 'Yes' : 'No'}</p>
        <p><strong>Joined:</strong> {new Date(profile.created_at).toLocaleString()}</p>
        <p><strong>Last Updated:</strong> {new Date(profile.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default UserProfile;