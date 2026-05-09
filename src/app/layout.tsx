import type { Metadata } from "next";
import "./globals.css";
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
        {children}
      </body>
    </html>
  );
}
