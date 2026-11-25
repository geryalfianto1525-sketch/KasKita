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

// Sama dengan kartu di dashboard
const glassCardClass =
  "border border-white/10 bg-[#1a1a1a]/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/10 before:pointer-events-none before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";

const inputClass =
  "bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12 shadow-inner focus-visible:ring-1 focus-visible:ring-blue-500/50";

export default function KelolaSiswa() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [namaBaru, setNamaBaru] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      await fetchSiswa();
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
    <main className="relative min-h-screen overflow-hidden bg-[#050505] p-4 md:p-8 transition-colors duration-500">
      {/* ORNAMEN CAHAYA */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Kelola Siswa</h1>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className={glassCardClass}>
            <CardHeader>
              <CardTitle className="text-white text-lg font-semibold">Tambah Siswa Baru</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Nama Lengkap Siswa..."
                value={namaBaru}
                onChange={(e) => setNamaBaru(e.target.value)}
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && handleTambah()}
              />
              <Button
                onClick={handleTambah}
                disabled={loading}
                className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl px-8 h-12 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/50 transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                <Plus className="w-5 h-5 mr-2" /> {loading ? "Menyimpan..." : "Tambah"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={glassCardClass}>
            <CardHeader>
              <CardTitle className="text-white text-lg font-semibold">Daftar Siswa ({siswa.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto pr-2">
              {siswa.length === 0 ? (
                <p className="text-slate-500 text-center py-10">Belum ada data siswa.</p>
              ) : (
                siswa.map((s) => (
                  <div key={s.id} className="flex justify-between items-center border-b border-white/5 py-3">
                    <span className="font-semibold text-slate-200">{s.nama}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleHapus(s.id, s.nama)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
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