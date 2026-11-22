"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ChartKas({ masuk, keluar }: { masuk: number; keluar: number }) {
  const data = [
    { name: "Pemasukan", value: masuk },
    { name: "Pengeluaran", value: keluar },
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  if (masuk === 0 && keluar === 0) {
    return (
      <div className="flex items-center justify-center h-62.5 text-slate-400">
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
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`} 
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}