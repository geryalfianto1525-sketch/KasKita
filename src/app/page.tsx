"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet, Users, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 transition-colors duration-500">
      
      {/* ORNAMEN CAHAYA */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full blur-[120px] pointer-events-none"></div>

      {/* NAVBAR LANDING PAGE */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
          <span className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">KasKita</span>
        </div>
        <Link href="/login">
          <Button className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full px-6 font-bold shadow-lg shadow-blue-500/30">
            Masuk Aplikasi
          </Button>
        </Link>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 mb-8 text-sm font-bold text-blue-600 dark:text-blue-400 shadow-sm">
            <Sparkles className="w-4 h-4" /> Aplikasi Kas Kelas Masa Kini
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-800 dark:text-white mb-6 leading-tight">
            Kelola uang kas <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-cyan-500 to-purple-600 dark:from-blue-400 dark:via-cyan-300 dark:to-purple-400">
              tanpa pusing
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
            Lupakan buku catatan manual. KasKita membantu bendahara mencatat pemasukan, pengeluaran, dan status pembayaran siswa secara transparan dan otomatis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl px-8 py-7 text-lg font-bold shadow-xl shadow-blue-500/30 transition-all hover:scale-105 flex items-center gap-2">
                Mulai Sekarang <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* FITUR CARDS */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full"
        >
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 rounded-3xl text-left shadow-xl">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Pencatatan Otomatis</h3>
            <p className="text-slate-600 dark:text-slate-400">Catat uang masuk dan keluar dengan mudah. Saldo dihitung secara otomatis dan akurat.</p>
          </div>

          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 rounded-3xl text-left shadow-xl">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Status Siswa Transparan</h3>
            <p className="text-slate-600 dark:text-slate-400">Pantau siapa saja yang sudah lunas dan belum bayar di setiap periode kas mingguan.</p>
          </div>

          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 rounded-3xl text-left shadow-xl">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Laporan Siap Ekspor</h3>
            <p className="text-slate-600 dark:text-slate-400">Unduh laporan keuangan dalam format Excel atau PDF untuk diserahkan ke wali kelas.</p>
          </div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-8 text-slate-500 dark:text-slate-400 font-medium text-sm border-t border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md">
        &copy; 2026 KasKita. Dibuat oleh Tim PPLG XB-Class.
      </footer>
    </div>
  );
}