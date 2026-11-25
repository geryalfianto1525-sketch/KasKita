"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet, Users, ShieldCheck, ArrowRight } from "lucide-react";

// Sama dengan kartu di dashboard
const glassCardClass =
  "border border-white/10 bg-[#1a1a1a]/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/10 before:pointer-events-none before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#050505]">
      {/* ORNAMEN CAHAYA */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]"></div>
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
          <span className="font-black text-2xl text-white tracking-tight">KasKita</span>
        </div>
        <Link href="/login">
          <Button className="bg-blue-600/80 hover:bg-blue-600 text-white rounded-full px-6 font-bold border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            Masuk Aplikasi
          </Button>
        </Link>
      </nav>

      {/* HERO */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 text-sm font-bold text-blue-400">
            <Sparkles className="w-4 h-4" /> Aplikasi Kas Kelas Masa Kini
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            Kelola uang kas <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-300 to-purple-400">
              tanpa pusing
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
            Lupakan buku catatan manual. KasKita membantu bendahara mencatat pemasukan, pengeluaran, dan status pembayaran siswa secara transparan dan otomatis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button className="w-full sm:w-auto bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-2xl px-8 py-7 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/50 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center gap-2">
                Mulai Sekarang <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* FITUR */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full"
        >
          <div className={`${glassCardClass} p-8 text-left`}>
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Pencatatan Otomatis</h3>
            <p className="text-slate-400">Catat uang masuk dan keluar dengan mudah. Saldo dihitung secara otomatis dan akurat.</p>
          </div>

          <div className={`${glassCardClass} p-8 text-left`}>
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Status Siswa Transparan</h3>
            <p className="text-slate-400">Pantau siapa saja yang sudah lunas dan belum bayar di setiap periode kas mingguan.</p>
          </div>

          <div className={`${glassCardClass} p-8 text-left`}>
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Laporan Siap Ekspor</h3>
            <p className="text-slate-400">Unduh laporan keuangan dalam format Excel atau PDF untuk diserahkan ke wali kelas.</p>
          </div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-8 text-slate-500 font-medium text-sm border-t border-white/10 bg-black/20 backdrop-blur-md">
        &copy; 2026 KasKita. Dibuat oleh Tim PPLG XB-Class.
      </footer>
    </div>
  );
}