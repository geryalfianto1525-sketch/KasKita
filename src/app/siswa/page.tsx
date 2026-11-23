"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type Transaksi = { id: number; keterangan: string; jumlah: number; periode: string; };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 p-4 md:p-8 transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white">Halo, {namaSiswa}!</h1>
            <p className="text-slate-500 font-medium mt-1">Ini adalah ringkasan kas kelasmu.</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="rounded-full shadow-lg shadow-red-500/20">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl mb-8">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-500" /> Riwayat Pembayaranmu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transaksi.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold text-lg">Kamu belum pernah membayar kas.</p>
                  <p className="text-slate-400 text-sm">Silakan hubungi Bendahara kelas.</p>
                </div>
              ) : (
                transaksi.map((t) => (
                  <div key={t.id} className="flex justify-between items-center bg-green-50 dark:bg-green-950/30 p-4 rounded-xl border border-green-200 dark:border-green-900 mb-3">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> {t.periode}
                    </span>
                    <span className="font-black text-green-600 dark:text-green-400">Rp {t.jumlah.toLocaleString("id-ID")}</span>
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