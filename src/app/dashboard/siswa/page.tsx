"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2, Plus, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Siswa = { id: number; nama: string; status: string; };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function KelolaSiswa() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [namaBaru, setNamaBaru] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
    };
    checkUser();
  }, [router]);

  const fetchSiswa = async () => {
    const { data } = await supabase.from("siswa").select("*").order("nama");
    if (data) setSiswa(data);
  };

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

      // 3. Kalau lolos (Admin), ambil data siswa
      const { data } = await supabase.from("siswa").select("*").order("nama");
      if (data) setSiswa(data);
    };
    
    checkUserAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleTambah = async () => {
    if (!namaBaru) return toast.error("Nama siswa tidak boleh kosong!");
    setLoading(true);

    const { error } = await supabase.from("siswa").insert([{ nama: namaBaru.toUpperCase(), status: "Belum" }]);
    
    if (error) {
      toast.error("Gagal menambah siswa: " + error.message);
    } else {
      toast.success("Siswa berhasil ditambahkan!");
      setNamaBaru("");
      fetchSiswa();
    }
    setLoading(false);
  };

  const handleHapus = async (id: number, nama: string) => {
    if (confirm(`Yakin mau menghapus ${nama} dari daftar kelas?`)) {
      const { error } = await supabase.from("siswa").delete().eq("id", id);
      if (error) toast.error("Gagal menghapus: " + error.message);
      else {
        toast.success(`${nama} telah dihapus.`);
        fetchSiswa();
      }
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 p-4 md:p-8 transition-colors duration-500">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full bg-white/50 dark:bg-black/50 border-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-black text-slate-800 dark:text-white">Kelola Siswa</h1>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl mb-8">
            <CardHeader><CardTitle className="text-slate-800 dark:text-white">Tambah Siswa Baru</CardTitle></CardHeader>
            <CardContent className="flex gap-4">
              <Input 
                placeholder="Nama Lengkap Siswa..." 
                value={namaBaru} 
                onChange={(e) => setNamaBaru(e.target.value)} 
                className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleTambah()}
              />
              <Button onClick={handleTambah} disabled={loading} className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-blue-500/30">
                <Plus className="w-5 h-5 mr-2" /> {loading ? "Menyimpan..." : "Tambah"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
            <CardHeader><CardTitle className="text-slate-800 dark:text-white">Daftar Siswa ({siswa.length})</CardTitle></CardHeader>
            <CardContent className="max-h-500px overflow-y-auto pr-2">
              {siswa.length === 0 ? (
                <p className="text-slate-500 text-center py-10">Belum ada data siswa.</p>
              ) : (
                siswa.map((s) => (
                  <div key={s.id} className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 py-3">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{s.nama}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleHapus(s.id, s.nama)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="w-5 h-5" />
                    </Button>
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