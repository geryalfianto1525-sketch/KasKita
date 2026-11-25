"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sama dengan kartu di dashboard
const glassCardClass =
  "border border-white/10 bg-[#1a1a1a]/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/10 before:pointer-events-none before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";

const inputClass =
  "bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12 shadow-inner focus-visible:ring-1 focus-visible:ring-blue-500/50";

export default function PengaturanPage() {
  const [namaKelas, setNamaKelas] = useState("");
  const [namaBendahara, setNamaBendahara] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // SATPAM & FETCH DATA
  useEffect(() => {
    const checkUserAndFetch = async () => {
      // 1. Cek Login
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 2. Satpam Cek Siswa
      const { data: dataSiswa } = await supabase
        .from("siswa")
        .select("id")
        .eq("email", session.user.email)
        .maybeSingle();

      // Kalau dia siswa, tendang ke /siswa
      if (dataSiswa) {
        router.push("/siswa");
        return;
      }

      // 3. Kalau lolos (Admin), ambil data pengaturan
      const { data } = await supabase.from("pengaturan").select("*").eq("id", 1).single();
      if (data) {
        setNamaKelas(data.nama_kelas);
        setNamaBendahara(data.nama_bendahara);
      }
    };

    checkUserAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSimpan = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("pengaturan")
      .update({ nama_kelas: namaKelas, nama_bendahara: namaBendahara })
      .eq("id", 1);

    if (error) toast.error("Gagal menyimpan pengaturan");
    else toast.success("Pengaturan berhasil disimpan!");
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] p-4 md:p-8 transition-colors duration-500">
      {/* ORNAMEN CAHAYA */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Pengaturan</h1>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={glassCardClass}>
            <CardHeader>
              <CardTitle className="text-white text-lg font-semibold">Profil Kelas</CardTitle>
              <CardDescription className="text-slate-400">Informasi ini akan muncul di laporan PDF dan Excel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-300 ml-1 mb-2 block">Nama Kelas</label>
                <Input
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  placeholder="cth: XI PPLG 1"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-300 ml-1 mb-2 block">Nama Bendahara</label>
                <Input
                  value={namaBendahara}
                  onChange={(e) => setNamaBendahara(e.target.value)}
                  placeholder="cth: Jery Alfianto"
                  className={inputClass}
                />
              </div>
              <Button
                onClick={handleSimpan}
                disabled={loading}
                className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl py-6 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/50 transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                <Save className="w-5 h-5 mr-2" /> {loading ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}