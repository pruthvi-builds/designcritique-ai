import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DesignCritique AI",
  description: "Upload a UI screenshot and get an AI-powered usability heuristic evaluation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              DesignCritique AI
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-stone-600">
              <Link href="/" className="hover:text-stone-900">
                Critique
              </Link>
              <Link href="/contrast-checker" className="hover:text-stone-900">
                Contrast checker
              </Link>
              <a
                href="https://github.com/pruthvi-builds/designcritique-ai"
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
