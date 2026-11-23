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
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 p-4 md:p-8 transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full bg-white/50 dark:bg-black/50 border-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-black text-slate-800 dark:text-white">Pengaturan</h1>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white">Profil Kelas</CardTitle>
              <CardDescription className="text-slate-500">Informasi ini akan muncul di laporan PDF dan Excel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-2 block">Nama Kelas</label>
                <Input 
                  value={namaKelas} 
                  onChange={(e) => setNamaKelas(e.target.value)} 
                  placeholder="cth: XI PPLG 1" 
                  className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-2 block">Nama Bendahara</label>
                <Input 
                  value={namaBendahara} 
                  onChange={(e) => setNamaBendahara(e.target.value)} 
                  placeholder="cth: Jery Alfianto" 
                  className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12"
                />
              </div>
              <Button onClick={handleSimpan} disabled={loading} className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-500/30">
                <Save className="w-5 h-5 mr-2" /> {loading ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}