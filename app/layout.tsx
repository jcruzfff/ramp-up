import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PrivyProvider from "@/app/providers/PrivyProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellar Swipe",
  description: "A social crowdfunding app on Stellar with swipe-to-fund UX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PrivyProvider>
            <div className="min-h-screen flex flex-col">
              {/* Main content */}
              <main className="flex-grow">{children}</main>
              <Toaster position="top-center" richColors />
            </div>
        </PrivyProvider>
      </body>
    </html>
  );
}
