"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-parchment px-4">
      <a href="/">
        <img
          src="/images/tutorme-icon.png"
          alt="TutorMe"
          className="w-[168px] h-[168px] mb-6 rounded-xl"
        />
      </a>

      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
        <p className="text-ink/60 mb-8 text-sm">Log in to keep practicing.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-ink/70 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-mist bg-white px-3 py-2 text-ink focus:border-signal"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/70 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-mist bg-white px-3 py-2 text-ink focus:border-signal"
            />
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-ink text-parchment py-2.5 font-medium hover:bg-ink/90 transition disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          New here?{" "}
          <a href="/signup" className="text-signal underline">
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
