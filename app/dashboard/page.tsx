import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const metaFullName = (userData.user!.user_metadata?.full_name as string) || "";
  const metaRole = (userData.user!.user_metadata?.role as string) || "";

  let fullName = metaFullName;
  let role = metaRole;

  if (!fullName || !role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userData.user!.id)
      .single();

    fullName = fullName || profile?.full_name || "";
    role = role || profile?.role || "student";
  }

  const firstName = fullName.split(" ")[0] || "there";

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, description, level")
    .order("created_at", { ascending: true });

  const { data: progress } = await supabase
    .from("progress")
    .select("lesson_id, status")
    .eq("student_id", userData.user!.id);

  const progressByLesson = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p.status])
  );

  return (
    <main className="min-h-screen bg-parchment px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-ink/50 text-sm">
              {role === "teacher" ? "Teacher dashboard" : "Your lessons"}
            </p>
            <h1 className="font-display text-3xl text-ink">
              Hi, {firstName}!
            </h1>
          </div>
          <a href="/logout" className="text-sm text-ink/60 underline">
            Log out
          </a>
        </header>

        <div className="space-y-3">
          {(lessons ?? []).map((lesson) => {
            const status = progressByLesson.get(lesson.id) ?? "not_started";
            return (
              <a
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="block rounded-lg border border-mist bg-white p-4 hover:border-signal transition"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg text-ink">{lesson.title}</h2>
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 ${
                      status === "completed"
                        ? "bg-signal/10 text-signal"
                        : status === "in_progress"
                        ? "bg-coral/10 text-coral"
                        : "bg-mist text-ink/50"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-ink/60 text-sm mt-1">{lesson.description}</p>
                <p className="text-ink/40 text-xs mt-2 capitalize">{lesson.level}</p>
              </a>
            );
          })}

          {(!lessons || lessons.length === 0) && (
            <p className="text-ink/50 text-sm">No lessons yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
