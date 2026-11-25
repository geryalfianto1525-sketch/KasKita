"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("Login Gagal: " + error.message);
      } else {
        const { data: dataSiswa } = await supabase
          .from("siswa")
          .select("id")
          .eq("email", data.user?.email)
          .maybeSingle();

        if (dataSiswa) {
          router.push("/siswa");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage("Daftar Gagal: " + error.message);
      else { setMessage("Pendaftaran berhasil! Silakan klik Masuk."); setIsLogin(true); }
    }
    setLoading(false);
  };

  return (
    // 1. BACKGROUND SUPER GELAP (Hampir hitam pekat)
    <div className="min-h-screen flex bg-[#050505] text-slate-200 selection:bg-blue-500/30 font-sans overflow-hidden">

      {/* BAGIAN KIRI (Branding & Estetika) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-[#050505] to-[#0a0f1a] border-r border-white/5 relative">

        {/* 2. ORNAMEN PENDAHULUAN NEON (Glow tipis biru & hijau) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          {/* Logo Minimalis */}
          <div className="flex items-center gap-3 mb-32">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            <span className="font-semibold tracking-[0.2em] text-sm text-slate-300">KAS KITA • PORTAL</span>
          </div>

          <div className="max-w-md">
            <p className="text-blue-500 font-bold tracking-[0.15em] text-xs mb-6 uppercase">Senang Melihat Anda Lagi</p>
            {/* 3. TYPOGRAPHY BESAR & TEGAS */}
            <h1 className="text-6xl font-bold mb-8 leading-[1.1] text-white tracking-tight">
              Selamat<br />Datang.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-light">
              Masuk untuk melanjutkan perjalanan Anda. Kelola proyek dan kebutuhan Anda dalam satu dasbor yang tenang.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-slate-600 text-xs tracking-wider">
          © 2026 KAS KITA PORTAL
        </div>
      </div>

      {/* BAGIAN KANAN (Form Login) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="w-full max-w-[400px]">

          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-16">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
            <span className="font-semibold tracking-[0.2em] text-sm">KAS KITA</span>
          </div>

          <div className="mb-10">
            {/* 4. BADGE LOGIN (Warna dasar gelap, border tipis biru) */}
            <span className="inline-block bg-[#0f172a] text-blue-400 text-[10px] tracking-widest font-bold px-3 py-1.5 rounded-sm mb-6 border border-blue-900/50 uppercase">
              Login Account
            </span>
            <h2 className="text-3xl font-semibold mb-3 text-white tracking-tight">
              {isLogin ? "Masuk Akun" : "Daftar Akun"}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin ? "Silakan masukkan detail Anda untuk melanjutkan." : "Buat akun untuk mulai mengelola kas."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alamat Email</label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // 5. INPUT FORM ELEGAN (Background hitam, border tipis)
                className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-slate-700 h-12 focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-md transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-slate-700 h-12 pr-10 focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-md transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {message && <p className="text-xs font-semibold text-red-400 bg-red-950/20 p-3 rounded-md border border-red-900/30 text-center">{message}</p>}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="w-3.5 h-3.5 rounded-sm border-white/10 bg-[#0a0a0a] accent-blue-600 cursor-pointer" />
                <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">Ingat saya</label>
              </div>
              <button type="button" onClick={() => { }} className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors">
                Lupa kata sandi?
              </button>
            </div>

            {/* 6. TOMBOL SOLID BIRU (Tanpa gradien norak, murni warna solid) */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-md font-semibold text-sm tracking-wide transition-all mt-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            >
              {loading ? "MEMPROSES..." : "MASUK"}
            </Button>
          </form>

          <div className="mt-8 text-left text-xs text-slate-500">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setMessage(""); }}
              className="text-blue-500 font-bold hover:text-blue-400 transition-colors hover:underline"
            >
              {isLogin ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}