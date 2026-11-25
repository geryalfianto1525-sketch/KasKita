"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ChartKas({ masuk, keluar }: { masuk: number; keluar: number }) {
  const data = [
    { name: "Pemasukan", value: masuk },
    { name: "Pengeluaran", value: keluar },
  ];

  // Sama dengan warna emerald dan red yang dipakai di dashboard
  const COLORS = ["#10b981", "#ef4444"];

  if (masuk === 0 && keluar === 0) {
    return (
      <div className="flex items-center justify-center h-62.5 text-slate-500">
        Belum ada data untuk ditampilkan di grafik.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#e2e8f0",
          }}
          itemStyle={{ color: "#e2e8f0" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: "#cbd5e1", fontSize: "13px" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}