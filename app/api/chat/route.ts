import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { lessonId, lessonTitle, steps, history } = await req.json();

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const systemPrompt = `You are a warm, patient spoken-English tutor helping a student practice "${lessonTitle}".
Lesson steps to guide the conversation: ${steps.join(", ")}.
Rules:
- Keep replies short (1-3 sentences) — this is a SPOKEN conversation, not a text chat.
- Gently correct grammar/pronunciation mistakes by modeling the correct phrase back, don't lecture.
- Ask one follow-up question to keep the student talking.
- Encourage and stay positive.`;

  const anthropicMessages = (history ?? []).map((m: { role: string; text: string }) => ({
    role: m.role === "student" ? "user" : "assistant",
    content: m.text,
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: systemPrompt,
      messages: anthropicMessages,
    }),
  });

  const data = await response.json();
  const reply =
    data?.content?.find((c: any) => c.type === "text")?.text ??
    "Sorry, could you say that again?";

  if (userData.user) {
    await supabase.from("progress").upsert(
      {
        student_id: userData.user.id,
        lesson_id: lessonId,
        status: "in_progress",
        transcript: [...(history ?? []), { role: "tutor", text: reply }],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,lesson_id" }
    );
  }

  return NextResponse.json({ reply });
}
