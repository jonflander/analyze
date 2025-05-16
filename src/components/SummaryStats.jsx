import React from "react";

function calcStats(data) {
  if (!data || !data.length) return { total: 0, avg: 0, max: 0 };
  const total = data.reduce((sum, d) => sum + (d.volume || 0), 0);
  const avg = total / data.length;
  const max = Math.max(...data.map(d => d.volume || 0));
  return { total, avg, max };
}

export default function SummaryStats({ data, periods }) {
  const s1 = calcStats(data.period1);
  const s2 = calcStats(data.period2);
  const pct = s1.total ? (((s2.total - s1.total) / s1.total) * 100).toFixed(1) : "—";
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "24px 0" }}>
      <div style={{ background: "#f6f8fa", padding: 12, borderRadius: 8, flex: 1 }}>
        <div style={{ fontSize: 12, color: "#555" }}>{periods.period1.label} Total Volume</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{s1.total.toLocaleString()}</div>
      </div>
      <div style={{ background: "#f6f8fa", padding: 12, borderRadius: 8, flex: 1 }}>
        <div style={{ fontSize: 12, color: "#555" }}>{periods.period2.label} Total Volume</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{s2.total.toLocaleString()}</div>
      </div>
      <div style={{ background: "#f6f8fa", padding: 12, borderRadius: 8, flex: 1 }}>
        <div style={{ fontSize: 12, color: "#555" }}>Average Daily Volume Change</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{pct}%</div>
      </div>
      <div style={{ background: "#f6f8fa", padding: 12, borderRadius: 8, flex: 1 }}>
        <div style={{ fontSize: 12, color: "#555" }}>Highest Daily Volume</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{Math.max(s1.max, s2.max).toLocaleString()}</div>
      </div>
    </div>
  );
}
