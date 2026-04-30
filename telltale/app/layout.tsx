import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import Navbar from "@/components/navigation/Navbar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import ConditionalChatBot from "@/components/chat/ConditionalChatBot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TellTale - Social Book Recommendation & Discussion Platform",
  description: "Discover your next favorite book, connect with friends, and join meaningful discussions. Your social book club awaits!",
  keywords: ["books", "reading", "recommendations", "literature", "book club", "social reading", "book discussions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-body antialiased bg-light dark:bg-dark text-gray-900 dark:text-gray-100`}
      >
        <Providers>
          <Navbar />
          {children}
          <MobileBottomNav />
          <ConditionalChatBot />
        </Providers>
      </body>
    </html>
  );
}
