/**
 * Home page component
 */
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Evolve Todo App</h1>
      <p>Welcome to the Evolve Todo Application</p>
      <div style={{ marginTop: '20px' }}>
        <Link href="/login" style={{ margin: '0 10px', textDecoration: 'none', color: '#0070f3' }}>
          Login
        </Link>
        <Link href="/register" style={{ margin: '0 10px', textDecoration: 'none', color: '#0070f3' }}>
          Register
        </Link>
        <Link href="/dashboard" style={{ margin: '0 10px', textDecoration: 'none', color: '#0070f3' }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}