/**
 * Higher-order component to wrap protected routes in the todo application.
 * Redirects unauthenticated users to login page.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

// Higher-order component for protected routes
export const withAuth = (WrappedComponent) => {
  const AuthWrapper = (props) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      // If loading, show nothing
      if (isLoading) {
        return;
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        setAuthorized(false);
        router.push('/login');
      } else {
        setAuthorized(true);
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // If not authorized, don't render anything (redirect happens in useEffect)
    if (!authorized) {
      return null;
    }

    // If authorized, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Copy static methods from wrapped component
  if (WrappedComponent.getInitialProps) {
    AuthWrapper.getInitialProps = WrappedComponent.getInitialProps;
  }

  return AuthWrapper;
};

// Component for guest-only routes (like login/register)
export const GuestOnly = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If authenticated, don't render anything (redirect happens in useEffect)
  if (isAuthenticated) {
    return null;
  }

  // If not authenticated, render children
  return children;
};