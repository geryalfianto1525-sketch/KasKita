"use client"; 

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");

  // Fungsi ambil data dari Supabase
  const fetchData = async () => {
    const { data } = await supabase.from("transaksi").select("*").order("id", { ascending: false });
    if (data) setTransaksi(data);
  };

  // Jalankan saat halaman pertama kali dibuka
  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi tambah transaksi
    // Fungsi tambah transaksi
  const handleTambah = async () => {
    if (!keterangan || !jumlah) return alert("Isi semua data!");
    
    // Proses insert
    const { data, error } = await supabase.from("transaksi").insert([
      { keterangan: keterangan, jumlah: parseInt(jumlah), tipe: "masuk" }
    ]);

    // JIKA ADA ERROR, TAMPILKAN DI LAYAR
    if (error) {
      console.error("Detail Error:", error);
      alert("Gagal menyimpan: " + error.message);
    } else {
      // JIKA BERHASIL, BARU KOSONGKAN FORM
      setKeterangan("");
      setJumlah("");
      fetchData();
    }
  };

  // Hitung total saldo
  const totalSaldo = transaksi.reduce((acc, curr) => {
    return curr.tipe === "masuk" ? acc + curr.jumlah : acc - curr.jumlah;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">KasKita </h1>

      {/* Card Dashboard (Menggunakan shadcn/ui) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">Rp {totalSaldo.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        {/* Bisa tambah Card Total Masuk & Keluar di sini */}
      </div>

      {/* Form Tambah Transaksi */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tambah Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Keterangan..." value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          <Input type="number" placeholder="Jumlah..." value={jumlah} onChange={(e) => setJumlah(e.target.value)} />
          <Button onClick={handleTambah}>Simpan</Button>
        </CardContent>
      </Card>

      {/* List Transaksi */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transaksi.map((t) => (
            <div key={t.id} className="flex justify-between border-b py-2">
              <span>{t.keterangan}</span>
              <span className={t.tipe === "masuk" ? "text-green-600" : "text-red-600"}>
                Rp {t.jumlah.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

