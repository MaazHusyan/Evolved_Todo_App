"use client";

import { useState } from "react";
import { authClient, setToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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
        // If it's the last attempt or a validation error (400/422), throw immediately
        if (i === maxRetries - 1 || (err.status && (err.status === 400 || err.status === 422))) {
          throw err;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await retryAuthOperation(() =>
        authClient.signUp.email({
          email,
          password,
          name,
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
            // Re-throw to be caught by retry logic or final catch
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
      title="Create your account"
      subtitle="Start organizing your tasks today"
    >
      <form className="space-y-5 sm:space-y-6" onSubmit={handleRegister}>
        {/* Name Input */}
        <GlassInput
          id="name"
          label="Full Name"
          type="text"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />

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
          autoComplete="new-password"
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
          Create account
        </GlassButton>
      </form>

      {/* Login Link */}
      <div className="mt-5 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-neon-blue hover:text-neon-purple transition-colors"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
