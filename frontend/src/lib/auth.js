import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

// Configure Pool with extended timeouts for Neon cold starts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon free tier databases pause after inactivity
  // Cold starts can take 30-60 seconds
  connectionTimeoutMillis: 60000, // 60 seconds
  idleTimeoutMillis: 30000,
  max: 20, // Maximum pool size
  // Enable keep-alive to prevent connection drops
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
  ],
});
