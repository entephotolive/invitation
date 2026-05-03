import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Online Invitations",
  description: "Create premium event invitation websites."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased font-inter">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
