import React, { useState, useEffect } from "react";
import SymbolSearch from "./components/SymbolSearch.jsx";
import DateRangePicker from "./components/DateRangePicker.jsx";
import VolumeComparisonChart from "./components/VolumeComparisonChart.jsx";
import DollarVolumeBarChart from "./components/DollarVolumeBarChart.jsx";
import SummaryStats from "./components/SummaryStats.jsx";
import { fetchHistorical } from "./utils/api.js";

const defaultPeriods = {
  period1: { label: "2023", start: "2023-04-01", end: "2023-12-31" },
  period2: { label: "2024", start: "2024-04-01", end: "2024-12-31" }
};

function App() {
  const [symbol, setSymbol] = useState("ETG.TO");
  const [periods, setPeriods] = useState(defaultPeriods);
  const [data, setData] = useState({ period1: [], period2: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, [symbol, periods]);

  async function fetchData() {
    setLoading(true);
    const [d1, d2] = await Promise.all([
      fetchHistorical(symbol, periods.period1.start, periods.period1.end),
      fetchHistorical(symbol, periods.period2.start, periods.period2.end)
    ]);
    setData({ period1: d1, period2: d2 });
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
        Stock Trading Volume & Dollar Volume Analyzer
      </h1>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        <SymbolSearch value={symbol} onChange={setSymbol} />
        <DateRangePicker periods={periods} onChange={setPeriods} />
        <button onClick={fetchData} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      <SummaryStats data={data} periods={periods} />
      <VolumeComparisonChart data={data} periods={periods} />
      <DollarVolumeBarChart data={data} periods={periods} />
    </div>
  );
}

export default App;
