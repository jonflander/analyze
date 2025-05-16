import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { parseISO, format } from "date-fns";

function groupByMonth(data) {
  const monthMap = {};
  data.forEach(d => {
    const m = format(parseISO(d.date), "yyyy-MM");
    const dv = (d.close || d.adjClose || 0) * (d.volume || 0);
    if (!monthMap[m]) monthMap[m] = 0;
    monthMap[m] += dv;
  });
  return monthMap;
}

export default function DollarVolumeBarChart({ data, periods }) {
  const m1 = groupByMonth(data.period1 || []);
  const m2 = groupByMonth(data.period2 || []);
  const months = Array.from(new Set([...Object.keys(m1), ...Object.keys(m2)])).sort();

  const chartData = months.map(month => ({
    month,
    [periods.period1.label]: m1[month] || 0,
    [periods.period2.label]: m2[month] || 0,
  }));

  return (
    <div style={{ margin: "40px 0" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, textAlign: "center", marginBottom: 10 }}>
        Monthly Trading Dollar Volume Comparison ({periods.period1.label} vs {periods.period2.label})
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={v => "$" + v.toLocaleString()} />
          <Legend />
          <Bar dataKey={periods.period1.label} fill="#222" />
          <Bar dataKey={periods.period2.label} fill="#35bdb2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
