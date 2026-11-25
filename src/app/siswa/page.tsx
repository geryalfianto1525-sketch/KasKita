"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, CheckCircle2, XCircle } from "lucide-react";

type Transaksi = { id: number; keterangan: string; jumlah: number; periode: string; };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sama dengan kartu di dashboard
const glassCardClass =
  "border border-white/10 bg-[#1a1a1a]/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/10 before:pointer-events-none before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";

export default function SiswaDashboard() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [namaSiswa, setNamaSiswa] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return router.push("/login");

      const { data: dataSiswa } = await supabase.from("siswa").select("*").eq("email", user.email).maybeSingle();

      if (!dataSiswa) {
        // Kalau dataSiswa kosong, berarti email tidak ada di tabel siswa
        alert("Email kamu tidak terdaftar sebagai siswa. Hubungi bendahara.");
        router.push("/dashboard");
        return;
      }

      setNamaSiswa(dataSiswa.nama);

      // Ambil riwayat pembayaran siswa ini saja
      const { data: dataTransaksi } = await supabase
        .from("transaksi")
        .select("*")
        .eq("siswa_id", dataSiswa.id)
        .order("id", { ascending: false });

      if (dataTransaksi) setTransaksi(dataTransaksi);
    };
    checkUser();
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] p-4 md:p-8 transition-colors duration-500">
      {/* ORNAMEN CAHAYA */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Halo, {namaSiswa}!</h1>
          <p className="text-slate-400 font-medium mt-1">Ini adalah ringkasan kas kelasmu.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={glassCardClass}>
            <CardHeader>
              <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" /> Riwayat Pembayaranmu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transaksi.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-slate-300 font-bold text-lg">Kamu belum pernah membayar kas.</p>
                  <p className="text-slate-500 text-sm">Silakan hubungi Bendahara kelas.</p>
                </div>
              ) : (
                transaksi.map((t) => (
                  <div key={t.id} className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-3">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.periode}
                    </span>
                    <span className="font-bold text-emerald-400">Rp {t.jumlah.toLocaleString("id-ID")}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}