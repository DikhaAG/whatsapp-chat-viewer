import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "WA Export Viewer | Offline WhatsApp Chat Reader",
  description: "A secure, client-side web application to read your exported WhatsApp chat history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased h-screen overflow-hidden bg-[var(--color-bg-primary)]">
        <AppProviders>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
