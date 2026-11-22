"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage("Login Gagal: " + error.message);
      else { router.push("/dashboard"); router.refresh(); }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage("Daftar Gagal: " + error.message);
      else { setMessage("Pendaftaran berhasil! Silakan klik Masuk."); setIsLogin(true); }
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 px-4 transition-colors duration-500">
      
      {/* ORNAMEN CAHAYA */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full blur-[120px] pointer-events-none"></div>

      <Card className="w-full max-w-md relative z-10 border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            {isLogin ? "Masuk ke KasKita" : "Daftar Akun Baru"}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
            {isLogin ? "Masukkan email dan password bendahara." : "Buat akun untuk mulai mengelola kas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12" />
            
            {message && <p className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg text-center">{message}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-linear-to-r from-blue-500 via-cyan-500 to-blue-500 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]">
              {loading ? "Memproses..." : (isLogin ? "Masuk" : "Daftar")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(""); }} className="text-blue-600 dark:text-blue-400 font-black hover:underline transition-all">
              {isLogin ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}