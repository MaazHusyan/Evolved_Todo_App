/**
 * Custom App component to wrap the application with AuthProvider
 */
import React from 'react';
import { AuthProvider } from '../lib/authContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;