"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [bypassLoading, setBypassLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBypassLogin() {
    setError(null);
    setBypassLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: "test@tutorme.com",
      password: "Tut0rM3T35t",
    });

    setBypassLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-parchment flex flex-col items-center justify-center px-6 text-center">
      <p className="text-signal text-sm font-medium mb-3 tracking-wide uppercase">
        Speak first. Read later.
      </p>
      <h1 className="font-display text-5xl text-ink max-w-lg leading-tight">
        Learn English by talking, not typing.
      </h1>
      <p className="text-ink/60 mt-4 max-w-md">
        Your tutor listens, responds out loud, and gently corrects you as you go —
        just like a real conversation.
      </p>
      <div className="flex gap-3 mt-8">
        <a
          href="/signup"
          className="rounded-md bg-ink text-parchment px-5 py-2.5 font-medium"
        >
          Get started
        </a>
        <a
          href="/login"
          className="rounded-md border border-mist px-5 py-2.5 font-medium text-ink"
        >
          Log in
        </a>
      </div>

      <div className="flex items-center gap-3 mt-10 w-full max-w-xs">
        <div className="flex-1 h-px bg-mist" />
        <span className="text-xs text-ink/40 uppercase tracking-wide">
          Beta testing
        </span>
        <div className="flex-1 h-px bg-mist" />
      </div>

      <button
        type="button"
        onClick={handleBypassLogin}
        disabled={bypassLoading}
        className="mt-4 rounded-md border border-signal text-signal px-5 py-2.5 font-medium hover:bg-signal/5 transition disabled:opacity-60"
      >
        {bypassLoading ? "Signing in…" : "Let me in"}
      </button>

      {error && <p className="text-coral text-sm mt-3">{error}</p>}
    </main>
  );
}
