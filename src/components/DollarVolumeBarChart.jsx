import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { parseISO, format } from "date-fns";

function groupByMonth(data) {
  const monthMap = {};
  data.forEach(d => {
    // Only use month name for display (no year)
    const monthKey = format(parseISO(d.date), "yyyy-MM"); // Keep year-month for sorting
    const displayMonth = format(parseISO(d.date), "MMM"); // Just month name for display
    const dv = (d.close || d.adjClose || 0) * (d.volume || 0);
    if (!monthMap[monthKey]) monthMap[monthKey] = { displayMonth, value: 0 };
    monthMap[monthKey].value += dv;
  });
  return monthMap;
}

export default function DollarVolumeBarChart({ data, periods }) {
  const m1 = groupByMonth(data.period1 || []);
  const m2 = groupByMonth(data.period2 || []);
  const monthKeys = Array.from(new Set([...Object.keys(m1), ...Object.keys(m2)])).sort();

  const chartData = monthKeys.map(monthKey => ({
    month: m1[monthKey]?.displayMonth || m2[monthKey]?.displayMonth, // Use just month name
    monthKey, // Keep the full key for sorting
    [periods.period1.label]: m1[monthKey]?.value || 0,
    [periods.period2.label]: m2[monthKey]?.value || 0,
  }));

  // Sort by month order
  chartData.sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Define chart colors - teal and black
  const tealColor = "#20B2AA";
  const blackColor = "#000000";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        Monthly Dollar Volume Analysis
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis tickFormatter={value => `$${(value / 1000000).toFixed(0)}M`} />
          <Tooltip 
            formatter={value => [`$${value.toLocaleString()}`, "Dollar Volume"]} 
            labelFormatter={label => `Month: ${label}`}
          />
          <Legend />
          <Bar dataKey={periods.period1.label} fill={blackColor} />
          <Bar dataKey={periods.period2.label} fill={tealColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
