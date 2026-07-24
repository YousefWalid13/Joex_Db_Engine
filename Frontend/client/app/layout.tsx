import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/sidebar/Sidebar";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "JOEX DB Engine",
  description:
    "A Next.js frontend scaffold for JOEX DB Engine using the hosted Fly backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "dark")}>
      <body className="min-h-full bg-background text-foreground font-sans">
        <QueryProvider>
          <div className="min-h-screen md:flex">
            <Sidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
