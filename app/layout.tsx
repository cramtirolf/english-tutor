import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk & Learn — English Tutor",
  description: "A voice-first English tutor for students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
