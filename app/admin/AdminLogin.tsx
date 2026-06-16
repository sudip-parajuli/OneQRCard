"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminLoginProps {
  adminEmail: string;
}

export default function AdminLogin({ adminEmail }: AdminLoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Login failed");
      }

      setMessage({
        type: "success",
        text: "Logged in successfully! Redirecting...",
      });

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to log in. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 block text-center mb-6">
          ← Back home
        </Link>
        <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          Enter your email and password to log in as administrator.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-stone-200 sm:rounded-2xl sm:px-10 shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-stone-700 mb-1">
                Admin Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="input font-medium"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input font-medium"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Log In as Admin"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
