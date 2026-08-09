"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LogoutPage() {
  const supabase = createClient();
  const [firstName, setFirstName] = useState("there");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function run() {
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user) {
        const metaFullName = (userData.user.user_metadata?.full_name as string) || "";
        const metaRole = (userData.user.user_metadata?.role as string) || "";

        let fullName = metaFullName;
        let role = metaRole;

        if (!fullName || !role) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", userData.user.id)
            .single();

          fullName = fullName || profile?.full_name || "";
          role = role || profile?.role || "student";
        }

        setFirstName(fullName.split(" ")[0] || "there");
        setRole(role === "teacher" ? "teacher" : "student");
      }

      await supabase.auth.signOut();
      setReady(true);
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-parchment flex flex-col items-center justify-center px-6 text-center">
      <a href="/">
        <img
          src="/images/tutorme-icon.png"
          alt="TutorMe"
          className="w-[240px] h-[240px] mb-6 rounded-xl"
        />
      </a>

      {ready ? (
        <h1 className="font-display text-3xl text-ink max-w-md leading-tight">
          {role === "teacher"
            ? `Session closed, ${firstName}!`
            : `Good progress! See you soon, ${firstName}!`}
        </h1>
      ) : (
        <h1 className="font-display text-3xl text-ink max-w-md leading-tight">
          Signing out…
        </h1>
      )}

      <a
        href="/login"
        className="mt-8 rounded-md bg-ink text-parchment px-5 py-2.5 font-medium"
      >
        Log in again
      </a>
    </main>
  );
}
