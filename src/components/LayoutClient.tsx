"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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

  // Halaman tanpa navbar
  const isPublicPage = pathname === "/login" || pathname === "/";

  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 bg-[#050505] flex flex-col justify-center items-center z-50">
          <div className="animate-bounce mb-4">
            <Image src="/logo.png" alt="KasKita Logo" width={120} height={120} className="drop-shadow-lg" />
          </div>
          <h1 className="text-blue-500 text-3xl font-extrabold tracking-widest animate-pulse">KasKita</h1>
        </div>
      ) : (
        <>
          {/* NAVBAR KACA GELAP */}
          {!isPublicPage && (
            <nav className="sticky top-0 z-40 bg-[#050505]/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                <span className="font-black text-xl text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
                  KasKita
                </span>
              </div>

              <Button
                size="sm"
                onClick={handleLogout}
                className="rounded-full px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </nav>
          )}

          {/* div, bukan main, karena tiap halaman sudah punya <main> sendiri */}
          <div className={isPublicPage ? "" : "min-h-screen"}>
            {children}
          </div>
        </>
      )}
    </>
  );
}