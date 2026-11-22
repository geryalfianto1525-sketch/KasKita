"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 1. PERBAIKAN: Definisikan Tipe Data (Menggantikan 'any')
type Transaksi = {
  id: number;
  keterangan: string;
  jumlah: number;
  tipe: string;
  created_at?: string;
};

type Siswa = {
  id: number;
  nama: string;
  status: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  // 2. PERBAIKAN: Gunakan Tipe Data yang sudah dibuat di atas
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");

  const fetchData = async () => {
    const { data: dataTransaksi } = await supabase.from("transaksi").select("*").order("id", { ascending: false });
    const { data: dataSiswa } = await supabase.from("siswa").select("*").order("id");

    if (dataTransaksi) setTransaksi(dataTransaksi);
    if (dataSiswa) setSiswa(dataSiswa);
  };

  useEffect(() => {
    // 3. PERBAIKAN: Abaikan peringatan ESLint (karena ini cara standar ambil data di Next.js)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleTambah = async () => {
    if (!keterangan || !jumlah) return alert("Isi semua data!");

    // 4. PERBAIKAN: Hapus 'data' yang tidak terpakai, kita hanya butuh 'error'
    const { error } = await supabase.from("transaksi").insert([
      { keterangan: keterangan, jumlah: parseInt(jumlah), tipe: "masuk" }
    ]);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      setKeterangan("");
      setJumlah("");
      fetchData();
    }
  };

  const handleBayar = async (id: number, nama: string) => {
    const { error } = await supabase.from("siswa").update({ status: "Lunas" }).eq("id", id);
    if (!error) {
      await supabase.from("transaksi").insert([{ keterangan: `Kas dari ${nama}`, jumlah: 5000, tipe: "masuk" }]);
      fetchData();
    }
  };

  const totalSaldo = transaksi.reduce((acc, curr) => {
    return curr.tipe === "masuk" ? acc + curr.jumlah : acc - curr.jumlah;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">KasKita (Beta)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader><CardTitle>Total Saldo</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">Rp {totalSaldo.toLocaleString("id-ID")}</p></CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>Tambah Pemasukan Kas</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Keterangan..." value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          <Input type="number" placeholder="Jumlah..." value={jumlah} onChange={(e) => setJumlah(e.target.value)} />
          <Button onClick={handleTambah}>Simpan</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Riwayat Transaksi</CardTitle></CardHeader>
          <CardContent>
            {transaksi.length === 0 ? <p className="text-gray-500">Belum ada transaksi.</p> : transaksi.map((t) => (
              <div key={t.id} className="flex justify-between border-b py-2">
                <span>{t.keterangan}</span>
                <span className="text-green-600 font-bold">+ Rp {t.jumlah.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Status Siswa</CardTitle></CardHeader>
          <CardContent>
            {siswa.map((s) => (
              <div key={s.id} className="flex justify-between items-center border-b py-2">
                <span>{s.nama}</span>
                {s.status === "Lunas" ? (
                  <span className="text-green-600 font-bold text-sm">LUNAS</span>
                ) : (
                  <Button size="sm" onClick={() => handleBayar(s.id, s.nama)}>Bayar 5.000</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}