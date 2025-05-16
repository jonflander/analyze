import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

function mergeData(data1, data2) {
  const map = {};
  data1.forEach(d => map[d.date] = { date: d.date, vol1: d.volume });
  data2.forEach(d => {
    if (map[d.date]) map[d.date].vol2 = d.volume;
    else map[d.date] = { date: d.date, vol2: d.volume };
  });
  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default function VolumeComparisonChart({ data, periods }) {
  const merged = mergeData(data.period1 || [], data.period2 || []);
  return (
    <div style={{ margin: "40px 0" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, textAlign: "center", marginBottom: 10 }}>
        Daily Trading Volume Comparison ({periods.period1.label} vs {periods.period2.label})
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={merged}>
          <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), "MMM")} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line name={periods.period1.label} type="monotone" dataKey="vol1" stroke="#222" dot={false} />
          <Line name={periods.period2.label} type="monotone" dataKey="vol2" stroke="#35bdb2" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
