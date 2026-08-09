import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import VoiceTutor from "@/components/VoiceTutor";

export default async function LessonPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, content")
    .eq("id", params.id)
    .single();

  if (!lesson) {
    redirect("/dashboard");
  }

  const steps: string[] = lesson.content?.steps ?? [];

  return (
    <main className="min-h-screen bg-parchment px-6 py-10">
      <div className="max-w-md mx-auto mb-4">
        <a href="/dashboard" className="text-sm text-ink/50">
          ← Back to lessons
        </a>
        <h1 className="font-display text-2xl text-ink mt-1">{lesson.title}</h1>
      </div>
      <VoiceTutor lessonId={lesson.id} lessonTitle={lesson.title} steps={steps} />
    </main>
  );
}
