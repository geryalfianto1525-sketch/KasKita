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
import { Wallet, Plus, Trash2, Search, Users, CheckCircle2, XCircle, FileSpreadsheet, FileText, CalendarDays, Eye, Settings, MessageCircle } from "lucide-react";
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

// LIQUID GLASS GELAP (Warna kaca transparan redup 40%)
const glassCardClass = "border border-white/10 bg-[#1a1a1a]/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/10 before:pointer-events-none before:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";

export default function Home() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tipe, setTipe] = useState("masuk");
  const [nominalKas, setNominalKas] = useState("3000");
  const [searchSiswa, setSearchSiswa] = useState("");
  const [periodeAktif, setPeriodeAktif] = useState("Minggu 1");
  const listPeriode = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Bulanan"];
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const router = useRouter();
  const [profilKelas, setProfilKelas] = useState({ nama_kelas: "Kelas", nama_bendahara: "Bendahara" });

  const fetchData = async () => {
    const { data: dataTransaksi } = await supabase.from("transaksi").select("*").order("id", { ascending: false });
    const { data: dataSiswa } = await supabase.from("siswa").select("*").order("id");
    const { data: dataPengaturan } = await supabase.from("pengaturan").select("*").eq("id", 1).single();

    if (dataTransaksi) setTransaksi(dataTransaksi);
    if (dataSiswa) setSiswa(dataSiswa);
    if (dataPengaturan) setProfilKelas(dataPengaturan);
  };

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: dataSiswa } = await supabase
        .from("siswa")
        .select("id")
        .eq("email", session.user.email)
        .maybeSingle();

      if (dataSiswa) {
        router.push("/siswa");
        return;
      }

      await fetchData();
    };

    checkUserAndFetch();
  }, [router]);

  const handleTambah = async () => {
    if (!keterangan || !jumlah) return toast.error("Isi semua data!");
    const { error } = await supabase.from("transaksi").insert([{
      keterangan, jumlah: parseInt(jumlah), tipe, periode: periodeAktif
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
      keterangan: `Kas ${periodeAktif} - ${nama}`, jumlah: parseInt(nominalKas), tipe: "masuk", periode: periodeAktif, siswa_id: id
    }]);
    if (!error) { fetchData(); toast.success(`${nama} berhasil dibayar`); }
  };

  const handleTagihWA = () => {
    const belumBayar = siswa.filter(s => !transaksiPeriodeIni.some(t => t.siswa_id === s.id));
    if (belumBayar.length === 0) return toast.success("Semua siswa sudah lunas!");

    let pesan = `*TAGIHAN KAS ${periodeAktif.toUpperCase()}*\nKelas: ${profilKelas.nama_kelas}\n\nHalo teman-teman, bagi yang belum membayar kas ${periodeAktif}, mohon segera diselesaikan ya. Terima kasih! 🙏\n\n*Daftar yang belum bayar:*\n`;
    belumBayar.forEach((s, index) => { pesan += `${index + 1}. ${s.nama}\n`; });
    pesan += `\nTotal: ${belumBayar.length} orang.`;

    navigator.clipboard.writeText(pesan).then(() => { toast.success("Teks tagihan dicopy!"); }).catch(() => { toast.error("Gagal menyalin."); });
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
    <main className="relative min-h-screen overflow-hidden bg-[#050505] p-4 md:p-8 transition-colors duration-500">

      {/* ORNAMEN CAHAYA LEBIH HIDUP (Glow 40%) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]"></div>
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Dashboard Kas.
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <Select value={periodeAktif} onValueChange={(val) => setPeriodeAktif(val || "Minggu 1")}>
                <SelectTrigger className="border-0 bg-transparent h-8 focus:ring-0 font-medium text-white w-[120px]">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {listPeriode.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Link href="/dashboard/siswa">
              <Button className="bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg flex gap-2 text-xs font-semibold h-10 border border-blue-500/50">
                <Users className="w-4 h-4" /> Kelola Siswa
              </Button>
            </Link>

            <Link href="/dashboard/pengaturan">
              <Button className="bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg flex gap-2 text-xs font-semibold h-10 border border-white/10">
                <Settings className="w-4 h-4" /> Pengaturan
              </Button>
            </Link>

            <Button onClick={handleTagihWA} className="bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg flex gap-2 text-xs font-semibold h-10 border border-emerald-500/50">
              <MessageCircle className="w-4 h-4" /> Tagih WA
            </Button>

            <Button onClick={exportExcel} className="bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg flex gap-2 text-xs font-semibold h-10 border border-white/10">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
            <Button onClick={exportPDF} className="bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg flex gap-2 text-xs font-semibold h-10 border border-white/10">
              <FileText className="w-4 h-4" /> PDF
            </Button>
          </div>
        </div>

        {/* KARTU STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div key={`saldo-${periodeAktif}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Card className={glassCardClass}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo ({periodeAktif})</p>
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">Rp {totalSaldo.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div key={`siswa-${periodeAktif}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}>
            <Card className={glassCardClass}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</p>
                  <Users className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">{totalSiswa} <span className="text-sm font-medium text-slate-400">Orang</span></p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div key={`lunas-${periodeAktif}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}>
            <Card className={glassCardClass}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lunas ({periodeAktif})</p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-white">{siswaLunas} <span className="text-sm font-medium text-slate-400">Orang</span></p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div key={`belum-${periodeAktif}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}>
            <Card className={glassCardClass}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Belum Bayar</p>
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-3xl font-bold text-white">{siswaBelum} <span className="text-sm font-medium text-slate-400">Orang</span></p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* BARIS 2: GRAFIK & FORM INPUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* GRAFIK */}
          <motion.div
            key={`grafik-${periodeAktif}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-1"
          >
            <Card className={glassCardClass}>
              <CardHeader><CardTitle className="text-white text-lg font-semibold">Arus Kas ({periodeAktif})</CardTitle></CardHeader>
              <CardContent><ChartKas masuk={totalMasuk} keluar={totalKeluar} /></CardContent>
            </Card>
          </motion.div>

          {/* FORM INPUT */}
          <motion.div
            key={`form-${periodeAktif}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <Card className={glassCardClass}>
              <CardHeader><CardTitle className="text-white text-lg font-semibold">Catat Transaksi Baru (Otomatis masuk ke {periodeAktif})</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Keterangan (cth: Beli Spidol)" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12 md:col-span-2 shadow-inner focus-visible:ring-1 focus-visible:ring-blue-500/50" />
                <Select value={tipe} onValueChange={(val) => setTipe(val || "masuk")}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white rounded-xl h-12 shadow-inner">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="masuk">Pemasukan</SelectItem>
                    <SelectItem value="keluar">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Jumlah (Rp)" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12 md:col-span-3 shadow-inner focus-visible:ring-1 focus-visible:ring-blue-500/50" />
                <Button onClick={handleTambah} className="w-full md:col-span-3 flex gap-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl py-6 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-inner border border-blue-400/50 transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                  <Plus className="w-5 h-5" /> Simpan Transaksi
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* BARIS 3: RIWAYAT & SISWA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RIWAYAT */}
          <motion.div
            key={`riwayat-${periodeAktif}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <Card className={glassCardClass}>
              <CardHeader><CardTitle className="text-white text-lg font-semibold">Riwayat Transaksi ({periodeAktif})</CardTitle></CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto pr-2">
                {transaksiPeriodeIni.length === 0 ? <p className="text-slate-500">Belum ada data di periode ini.</p> : transaksiPeriodeIni.map((t) => (
                  <div key={t.id} className="flex justify-between items-center border-b border-white/5 py-4">
                    <div>
                      <span className="font-semibold text-slate-200">{t.keterangan}</span>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{t.tipe}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${t.tipe === 'masuk' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {t.tipe === 'masuk' ? '+' : '-'} Rp {t.jumlah.toLocaleString("id-ID")}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleHapus(t.id)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* STATUS SISWA */}
          <motion.div
            key={`siswa-${periodeAktif}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Card className={glassCardClass}>
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-white text-lg font-semibold">Status {periodeAktif}</CardTitle>
                <div className="flex gap-2">
                  <Input type="number" value={nominalKas} onChange={(e) => setNominalKas(e.target.value)} className="w-24 h-9 bg-black/20 border-white/10 text-white text-sm focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner" placeholder="Nominal" />
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <Input placeholder="Cari..." value={searchSiswa} onChange={(e) => setSearchSiswa(e.target.value)} className="pl-9 h-9 bg-black/20 border-white/10 text-white text-sm w-32 focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto pr-2">
                {siswa
                  .filter(s => s.nama.toLowerCase().includes(searchSiswa.toLowerCase()))
                  .map((s) => {
                    const isLunas = transaksiPeriodeIni.some(t => t.siswa_id === s.id);

                    return (
                      <div key={s.id} className="flex justify-between items-center border-b border-white/5 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200 text-sm md:text-base">{s.nama}</span>
                          <button onClick={() => setSelectedSiswa(s)} className="text-[10px] text-blue-400 font-bold text-left hover:underline flex items-center gap-1 mt-1">
                            <Eye className="w-3 h-3" /> Riwayat
                          </button>
                        </div>

                        {isLunas ? (
                          <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap ml-2">LUNAS</span>
                        ) : (
                          <Button size="sm" onClick={() => handleBayar(s.id, s.nama)} className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 font-semibold text-xs whitespace-nowrap ml-2 border border-white/10">
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

        {/* MODAL (DIALOG) RIWAYAT SISWA */}
        <Dialog open={!!selectedSiswa} onOpenChange={(open) => !open && setSelectedSiswa(null)}>
          <DialogContent className="bg-[#1a1a1a]/90 backdrop-blur-xl border-white/10 text-white rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Riwayat Kas: <span className="text-blue-400">{selectedSiswa?.nama}</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm">
                Daftar periode kas yang sudah dibayar oleh siswa ini.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {transaksi.filter(t => t.siswa_id === selectedSiswa?.id).length === 0 ? (
                <p className="text-center text-slate-500 font-bold py-4">Belum ada riwayat pembayaran.</p>
              ) : (
                transaksi.filter(t => t.siswa_id === selectedSiswa?.id).map((t) => (
                  <div key={t.id} className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <span className="font-semibold text-slate-300 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.periode}
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">Rp {t.jumlah.toLocaleString("id-ID")}</span>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}