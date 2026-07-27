import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/sidebar/Sidebar";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "JOX DB Engine",
  description:
    "A Next.js frontend scaffold for JOX DB Engine using the hosted Fly backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "dark")}>
      <body className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(242,194,48,0.12),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.02),_transparent_55%)] bg-background text-foreground font-sans">
        <QueryProvider>
          <div className="min-h-screen bg-transparent">
            <Sidebar />
            <div className="min-w-0 md:pl-[260px]">
              <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">
                {children}
              </div>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
