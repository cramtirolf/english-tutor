"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "student" | "tutor"; text: string };

type SpeechRecognitionInstance = any;

export default function VoiceTutor({
  lessonId,
  lessonTitle,
  steps,
}: {
  lessonId: string;
  lessonTitle: string;
  steps: string[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [handsFree, setHandsFree] = useState(true);
  const [typedFallback, setTypedFallback] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const handsFreeRef = useRef(true);
  const speakingRef = useRef(false);

  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition || !("speechSynthesis" in window)) {
      setSupported(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleStudentTurn(transcript);
      };
      recognition.onend = () => {
        setListening(false);
        if (handsFreeRef.current && !speakingRef.current) {
          restartListening();
        }
      };
      recognition.onerror = () => setListening(false);

      recognitionRef.current = recognition;
    }

    const opener = `Let's practice: ${lessonTitle}. ${steps[0]}. Go ahead, say something to start.`;
    speak(opener, () => {
      setMessages([{ role: "tutor", text: opener }]);
      if (handsFreeRef.current) startListening();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function speak(text: string, onDone?: () => void) {
    if (!("speechSynthesis" in window)) {
      onDone?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    setSpeaking(true);
    speakingRef.current = true;
    utterance.onend = () => {
      setSpeaking(false);
      speakingRef.current = false;
      onDone?.();
      if (handsFreeRef.current) startListening();
    };
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (!recognitionRef.current || speakingRef.current || listening) return;
    try {
      setListening(true);
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  }

  function restartListening() {
    setTimeout(() => startListening(), 250);
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setListening(false);
  }

  async function handleStudentTurn(text: string) {
    setMessages((prev) => [...prev, { role: "student", text }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        lessonTitle,
        steps,
        history: [...messages, { role: "student", text }],
      }),
    });

    const data = await res.json();
    const reply = data.reply || "Sorry, can you say that again?";

    setMessages((prev) => [...prev, { role: "tutor", text: reply }]);
    speak(reply);
  }

  function handleTypedSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!typedFallback.trim()) return;
    handleStudentTurn(typedFallback.trim());
    setTypedFallback("");
  }

  function toggleHandsFree() {
    const next = !handsFree;
    setHandsFree(next);
    handsFreeRef.current = next;
    if (next && !speakingRef.current && !listening) {
      startListening();
    } else if (!next) {
      stopListening();
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col items-center py-8">
        <button
          onClick={() => (handsFree ? stopListening() : startListening())}
          disabled={speaking}
          aria-label="Start speaking"
          className="relative w-24 h-24 rounded-full bg-signal text-white flex items-center justify-center disabled:opacity-70"
        >
          {listening && (
            <span className="absolute inset-0 rounded-full bg-signal animate-pulseRing" />
          )}
          <span className="relative text-sm font-medium">
            {speaking ? "Tutor…" : listening ? "Listening" : "Tap to talk"}
          </span>
        </button>

        <button
          onClick={toggleHandsFree}
          className="mt-3 text-xs underline text-ink/70"
        >
          Hands-free mode: {handsFree ? "On" : "Off"}
        </button>

        {!supported && (
          <p className="text-coral text-xs mt-3 text-center">
            Voice isn't supported in this browser. Type your answer below instead.
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-2 text-sm max-w-[85%] ${
              m.role === "tutor"
                ? "bg-white border border-mist text-ink"
                : "bg-ink text-parchment ml-auto"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleTypedSubmit} className="flex gap-2">
        <input
          value={typedFallback}
          onChange={(e) => setTypedFallback(e.target.value)}
          placeholder="Or type your answer…"
          className="flex-1 rounded-md border border-mist bg-white px-3 py-2 text-sm text-ink"
        />
        <button
          type="submit"
          className="rounded-md bg-ink text-parchment px-4 py-2 text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
