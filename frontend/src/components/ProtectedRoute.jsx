/**
 * ProtectedRoute component for protecting authenticated routes
 */
import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, isAuthenticated, loading = false }) => {
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check authentication status after mount to handle SSR properly
  useEffect(() => {
    // We've finished checking auth state
    setHasCheckedAuth(true);

    // Redirect to login if not authenticated and auth state has been checked
    if (!loading && !isAuthenticated) {
      // Store the current route to redirect back after login
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show nothing while checking auth state to prevent flashing
  if (loading || !hasCheckedAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;