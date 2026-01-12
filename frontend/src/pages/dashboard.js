/**
 * Dashboard page component
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import ProtectedRoute from '../components/ProtectedRoute';
import TaskList from '../components/TaskList';
import TaskCreationForm from '../components/TaskCreationForm';
import UserProfile from '../components/UserProfile';

export default function DashboardPage() {
  const { user, token, isAuthenticated, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after mounting
    setIsClient(true);
  }, []);

  // During SSR, we don't know the auth state yet, so don't render the protected route
  if (!isClient) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Dashboard</h1>
      </div>
    );
  }

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
      <div style={{ padding: '20px' }}>
        <h1>Dashboard</h1>

        {user && (
          <div style={{ marginBottom: '20px' }}>
            <UserProfile />
          </div>
        )}

        {user && token && (
          <>
            <TaskCreationForm
              userId={user.id}
              authToken={token}
              onTaskCreated={() => {
                // Refresh the task list
                window.location.reload();
              }}
            />

            <TaskList
              userId={user.id}
              authToken={token}
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}