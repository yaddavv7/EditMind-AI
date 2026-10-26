import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EditMind AI | AI-Powered Video Editing Platform",
  description:
    "Show us what you want. Give us your clips. Get an edit you can actually control. AI-driven video editing with real FFmpeg rendering, Reference DNA, and conversational editing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0D13] text-[#F3F4F6] antialiased selection:bg-violet-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
