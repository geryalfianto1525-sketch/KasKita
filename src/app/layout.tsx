import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient"; 
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] });

// JUDUL TAB BROWSER
export const metadata: Metadata = {
  title: "KasKita | Aplikasi Kas Kelas",
  description: "Aplikasi pengelolaan uang kas kelas digital untuk siswa dan bendahara.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LayoutClient>{children}</LayoutClient>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}