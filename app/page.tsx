export default function Home() {
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
    </main>
  );
}
