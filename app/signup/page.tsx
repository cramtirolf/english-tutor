"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login?justSignedUp=1");
  }

  return (
    <main className="min-h-screen flex flex-col items-center pt-12 bg-parchment px-4">
      <a href="/">
        <img
          src="/images/tutorme-icon.png"
          alt="TutorMe"
          className="w-[168px] h-[168px] mb-6 rounded-xl"
        />
      </a>

      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink mb-1">Create your account</h1>
        <p className="text-ink/60 mb-8 text-sm">
          Start speaking English with your tutor in minutes.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-ink/70 mb-1">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-mist bg-white px-3 py-2 text-ink focus:border-signal"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-mist bg-white px-3 py-2 text-ink focus:border-signal"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/70 mb-1">I am a</label>
            <div className="flex gap-2">
              {(["student", "teacher"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition ${
                    role === r
                      ? "border-signal bg-signal text-white"
                      : "border-mist bg-white text-ink/70"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-ink text-parchment py-2.5 font-medium hover:bg-ink/90 transition disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-signal underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
