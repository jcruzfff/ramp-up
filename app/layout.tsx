import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/providers/AuthProvider";
import { MenuProvider } from "@/app/context/MenuContext";
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
        <AuthProvider>
          <MenuProvider>
            <div className="min-h-screen flex flex-col">
              {/* Main content */}
              <main className="flex-grow">{children}</main>
              <Toaster position="top-center" richColors />
            </div>
          </MenuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
