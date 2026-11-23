"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Plus, Sparkles, Trash2, Search, Users, CheckCircle2, XCircle, FileSpreadsheet, FileText, CalendarDays, Eye } from "lucide-react";
import ChartKas from "@/components/ChartKas";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import Link from "next/link";

type Transaksi = { id: number; keterangan: string; jumlah: number; tipe: string; periode: string; siswa_id?: number; };
type Siswa = { id: number; nama: string; };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tipe, setTipe] = useState("masuk");
  const [nominalKas, setNominalKas] = useState("5000");
  const [searchSiswa, setSearchSiswa] = useState("");
  
  const [periodeAktif, setPeriodeAktif] = useState("Minggu 1");
  const listPeriode = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Bulanan"];
  
  // State untuk Modal Detail Siswa
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
    };
    checkUser();
  }, [router]);

  const fetchData = async () => {
    const { data: dataTransaksi } = await supabase.from("transaksi").select("*").order("id", { ascending: false });
    const { data: dataSiswa } = await supabase.from("siswa").select("*").order("id");
    if (dataTransaksi) setTransaksi(dataTransaksi);
    if (dataSiswa) setSiswa(dataSiswa);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleTambah = async () => {
    if (!keterangan || !jumlah) return toast.error("Isi semua data!");
    const { error } = await supabase.from("transaksi").insert([{ 
      keterangan, 
      jumlah: parseInt(jumlah), 
      tipe,
      periode: periodeAktif 
    }]);
    if (error) toast.error("Gagal menyimpan data");
    else { setKeterangan(""); setJumlah(""); setTipe("masuk"); fetchData(); toast.success("Transaksi berhasil disimpan"); }
  };

  const handleHapus = async (id: number) => {
    if (confirm("Yakin mau hapus transaksi ini?")) {
      await supabase.from("transaksi").delete().eq("id", id);
      fetchData();
      toast.success("Transaksi dihapus");
    }
  };

  const handleBayar = async (id: number, nama: string) => {
    const sudahBayar = transaksi.some(t => t.periode === periodeAktif && t.siswa_id === id);
    if (sudahBayar) return toast.info("Siswa ini sudah lunas untuk periode ini.");

    const { error } = await supabase.from("transaksi").insert([{ 
      keterangan: `Kas ${periodeAktif} - ${nama}`, 
      jumlah: parseInt(nominalKas), 
      tipe: "masuk",
      periode: periodeAktif,
      siswa_id: id 
    }]);
    if (!error) {
      fetchData();
      toast.success(`${nama} berhasil dibayar`);
    }
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transaksi);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kas");
    XLSX.writeFile(workbook, "Laporan_KasKita.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Kas Kelas - ${periodeAktif}`, 14, 15);
    const tableColumn = ["ID", "Keterangan", "Tipe", "Jumlah"];
    const tableRows = transaksi.map(t => [t.id, t.keterangan, t.tipe.toUpperCase(), `Rp ${t.jumlah}`]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`Laporan_Kas_${periodeAktif}.pdf`);
  };

  const transaksiPeriodeIni = transaksi.filter(t => t.periode === periodeAktif);
  
  const totalMasuk = transaksiPeriodeIni.filter(t => t.tipe === "masuk").reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKeluar = transaksiPeriodeIni.filter(t => t.tipe === "keluar").reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalSaldo = totalMasuk - totalKeluar;
  
  const totalSiswa = siswa.length;
  const siswaLunas = siswa.filter(s => transaksiPeriodeIni.some(t => t.siswa_id === s.id)).length;
  const siswaBelum = totalSiswa - siswaLunas;

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 p-4 md:p-8 transition-colors duration-500">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-cyan-500 to-purple-600 dark:from-blue-400 dark:via-cyan-300 dark:to-purple-400">
              Dashboard Kas
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-white/50 dark:border-white/10">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              <Select value={periodeAktif} onValueChange={(val) => setPeriodeAktif(val || "Minggu 1")}>
                <SelectTrigger className="border-0 bg-transparent h-8 focus:ring-0 font-bold text-blue-700 dark:text-blue-400 w-120px">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                  {listPeriode.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Link href="/dashboard/siswa">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 flex gap-2">
                <Users className="w-4 h-4" /> Kelola Siswa
              </Button>
            </Link>
            
            <Button onClick={exportExcel} className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/30 flex gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
            <Button onClick={exportPDF} className="bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/30 flex gap-2">
              <FileText className="w-4 h-4" /> PDF
            </Button>
          </div>
        </div>

        {/* KARTU STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase">Saldo ({periodeAktif})</p>
                  <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-black text-slate-800 dark:text-white">Rp {totalSaldo.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase">Total Siswa</p>
                  <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-3xl font-black text-slate-800 dark:text-white">{totalSiswa} <span className="text-sm font-medium text-slate-500">Orang</span></p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase">Lunas ({periodeAktif})</p>
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-black text-green-600 dark:text-green-400">{siswaLunas} <span className="text-sm font-medium text-slate-500">Orang</span></p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase">Belum Bayar</p>
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-3xl font-black text-red-600 dark:text-red-400">{siswaBelum} <span className="text-sm font-medium text-slate-500">Orang</span></p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* BARIS 2: GRAFIK & FORM INPUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
            <Card className="h-full border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
              <CardHeader><CardTitle className="text-slate-800 dark:text-white">Arus Kas ({periodeAktif})</CardTitle></CardHeader>
              <CardContent><ChartKas masuk={totalMasuk} keluar={totalKeluar} /></CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <Card className="h-full border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
              <CardHeader><CardTitle className="text-slate-800 dark:text-white">Catat Transaksi Baru (Otomatis masuk ke {periodeAktif})</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Keterangan (cth: Beli Spidol)" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12 md:col-span-2" />
                <Select value={tipe} onValueChange={(val) => setTipe(val || "masuk")}>
                  <SelectTrigger className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Pemasukan</SelectItem>
                    <SelectItem value="keluar">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Jumlah (Rp)" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="bg-white/60 dark:bg-black/40 border-white/50 dark:border-white/10 rounded-xl h-12 md:col-span-3" />
                <Button onClick={handleTambah} className="w-full md:col-span-3 flex gap-2 bg-linear-to-r from-blue-500 via-cyan-500 to-blue-500 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01]">
                  <Plus className="w-5 h-5" /> Simpan Transaksi
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* BARIS 3: RIWAYAT & SISWA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
              <CardHeader><CardTitle className="text-slate-800 dark:text-white">Riwayat Transaksi ({periodeAktif})</CardTitle></CardHeader>
              <CardContent className="max-h-500px overflow-y-auto pr-2">
                {transaksiPeriodeIni.length === 0 ? <p className="text-slate-500">Belum ada data di periode ini.</p> : transaksiPeriodeIni.map((t) => (
                  <div key={t.id} className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 py-4">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{t.keterangan}</span>
                      <p className="text-xs font-medium text-slate-500 capitalize">{t.tipe}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${t.tipe === 'masuk' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.tipe === 'masuk' ? '+' : '-'} Rp {t.jumlah.toLocaleString("id-ID")}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleHapus(t.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-xl rounded-3xl">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-slate-800 dark:text-white">Status {periodeAktif}</CardTitle>
                <div className="flex gap-2">
                  <Input type="number" value={nominalKas} onChange={(e) => setNominalKas(e.target.value)} className="w-24 h-9 bg-white/60 dark:bg-black/40 text-sm" placeholder="Nominal" />
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <Input placeholder="Cari..." value={searchSiswa} onChange={(e) => setSearchSiswa(e.target.value)} className="pl-9 h-9 bg-white/60 dark:bg-black/40 text-sm w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-500px overflow-y-auto pr-2"> 
                {siswa
                  .filter(s => s.nama.toLowerCase().includes(searchSiswa.toLowerCase()))
                  .map((s) => {
                  const isLunas = transaksiPeriodeIni.some(t => t.siswa_id === s.id);
                  
                  return (
                    <div key={s.id} className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base">{s.nama}</span>
                        {/* TOMBOL LIHAT RIWAYAT */}
                        <button onClick={() => setSelectedSiswa(s)} className="text-[10px] text-blue-500 font-bold text-left hover:underline flex items-center gap-1 mt-1">
                          <Eye className="w-3 h-3" /> Riwayat
                        </button>
                      </div>

                      {isLunas ? (
                        <span className="text-green-600 dark:text-green-400 font-bold text-xs bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 whitespace-nowrap ml-2">LUNAS</span>
                      ) : (
                        <Button size="sm" onClick={() => handleBayar(s.id, s.nama)} className="bg-linear-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-200 text-white dark:text-black hover:opacity-90 rounded-full px-4 font-bold text-xs whitespace-nowrap ml-2">
                          Bayar {parseInt(nominalKas || "0").toLocaleString("id-ID")}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* MODAL (DIALOG) RIWAYAT SISWA */}
      <Dialog open={!!selectedSiswa} onOpenChange={(open) => !open && setSelectedSiswa(null)}>
        <DialogContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/50 dark:border-slate-800 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 dark:text-white">
              Riwayat Kas: {selectedSiswa?.nama}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Berikut adalah daftar periode kas yang sudah dibayar oleh siswa ini.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2 max-h-300px overflow-y-auto pr-2">
            {transaksi.filter(t => t.siswa_id === selectedSiswa?.id).length === 0 ? (
              <p className="text-center text-red-500 font-bold py-4">Belum ada riwayat pembayaran.</p>
            ) : (
              transaksi.filter(t => t.siswa_id === selectedSiswa?.id).map((t) => (
                <div key={t.id} className="flex justify-between items-center bg-green-50 dark:bg-green-950/30 p-3 rounded-xl border border-green-200 dark:border-green-900">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> {t.periode}
                  </span>
                  <span className="font-black text-green-600 dark:text-green-400">Rp {t.jumlah.toLocaleString("id-ID")}</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}