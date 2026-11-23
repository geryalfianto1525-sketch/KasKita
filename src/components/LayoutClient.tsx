"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  
  return createClient(url, key);
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabase(); 
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Cek apakah sedang di halaman login
const isPublicPage = pathname === "/login" || pathname === "/";

  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col justify-center items-center z-50 transition-colors">
          <div className="animate-bounce mb-4">
            <Image src="/logo.png" alt="KasKita Logo" width={120} height={120} className="drop-shadow-lg" />
          </div>
          <h1 className="text-blue-600 dark:text-blue-500 text-3xl font-extrabold tracking-widest animate-pulse">KasKita</h1>
        </div>
      ) : (
        <>
          {/* NAVBAR KACA */}
          {!isPublicPage && (
            <nav className="sticky top-0 z-40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/20 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                <span className="font-black text-xl text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">KasKita</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full bg-white/50 dark:bg-black/50 border-white/20">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout} className="rounded-full px-4 shadow-lg shadow-red-500/20">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </nav>
          )}
          
          <main className={isPublicPage ? "" : "min-h-screen"}>
            {children}
          </main>
        </>
      )}
    </>
  );
}