import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Idea Bank",
  description: "An internal platform for employees to submit and browse ideas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-semibold text-sm">
              IB
            </div>
            <div>
              <p className="font-semibold leading-tight">Idea Bank</p>
              <p className="text-xs text-muted leading-tight">
                Submit and vote on ideas for the team
              </p>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
