import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from '@/components/providers/SessionProviderWrapper';
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { TokenManager } from "@/components/auth/TokenManager";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Hospital Booking System",
  description: "Book and manage medical appointments online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <ToastProvider>
            <TokenManager />
            <ConditionalNavbar />
            <main className="py-6">
              {children}
            </main>
            <ConditionalFooter />
          </ToastProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
