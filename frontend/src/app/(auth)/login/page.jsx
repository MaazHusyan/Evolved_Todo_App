"use client";

import { useState } from "react";
import { authClient, setToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Helper function to retry auth operations
  const retryAuthOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (err) {
        // If it's the last attempt or a validation error (400/422/401 for login), throw immediately
        if (i === maxRetries - 1 || (err.status && (err.status === 400 || err.status === 422 || err.status === 401))) {
          throw err;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await retryAuthOperation(() =>
        authClient.signIn.email({
          email,
          password,
        }, {
          onResponse: (ctx) => {
            const token = ctx.response.headers.get("set-auth-token");
            if (token) {
              setToken(token);
            }
          },
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            throw ctx.error;
          },
        })
      );
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to manage your tasks"
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        {/* Email Input */}
        <GlassInput
          id="email"
          label="Email address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        {/* Password Input */}
        <GlassInput
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          error={error}
        />

        {/* Submit Button */}
        <GlassButton
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          Sign in
        </GlassButton>
      </form>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-800 dark:text-gray-300">
          New to Evolve Todo?{' '}
          <Link
            href="/register"
            className="font-medium text-neon-blue hover:text-neon-purple transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
