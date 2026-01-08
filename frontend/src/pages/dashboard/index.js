/**
 * Dashboard page component for the todo application.
 * Shows user profile and todo management interface.
 */
import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { GuestOnly } from '../../components/AuthWrapper';

const DashboardPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // If not authenticated, show nothing (redirect will happen in AuthWrapper)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-indigo-600">Todo App</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  {user && (
                    <span className="text-gray-700">
                      Welcome, {user.username || user.email}!
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>

              {user && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Your Profile</h3>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-sm text-gray-900">{user.username || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member since</p>
                      <p className="text-sm text-gray-900">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Todo Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your todo items from here. Add, edit, complete, or delete your tasks.
                </p>

                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => router.push('/todos')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage Todos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Wrap with auth to protect this route
export default DashboardPage;