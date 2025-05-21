import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

function toMonthDay(dateStr) {
  const d = parseISO(dateStr);
  return format(d, "MMM-dd");
}

function prepareYoYData(data1 = [], data2 = [], label1 = "2023", label2 = "2024") {
  const map = {};

  data1.forEach(d => {
    const key = toMonthDay(d.date);
    if (!map[key]) map[key] = { x: key };
    map[key][label1] = d.volume;
  });

  data2.forEach(d => {
    const key = toMonthDay(d.date);
    if (!map[key]) map[key] = { x: key };
    map[key][label2] = d.volume;
  });

  // Sort by month-day using a base year (e.g., 2000) for accurate order
  return Object.values(map).sort((a, b) => {
    return new Date(`2000-${a.x}`) - new Date(`2000-${b.x}`);
  });
}

export default function VolumeComparisonChart({ data, periods }) {
  const label1 = periods?.period1?.label || "Period 1";
  const label2 = periods?.period2?.label || "Period 2";
  const chartData = prepareYoYData(data.period1, data.period2, label1, label2);

  // Define chart colors - teal and black
  const tealColor = "#20B2AA";
  const blackColor = "#000000";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        Volume Comparison
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <XAxis dataKey="x" />
          <YAxis tickFormatter={value => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString()} />
          <Tooltip 
            formatter={value => [value.toLocaleString(), "Volume"]} 
            labelFormatter={label => `Date: ${label}`}
          />
          <Legend />
          <Line 
            name={label1} 
            type="monotone" 
            dataKey={label1} 
            stroke={blackColor} 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6, strokeWidth: 0 }} 
          />
          <Line 
            name={label2} 
            type="monotone" 
            dataKey={label2} 
            stroke={tealColor} 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6, strokeWidth: 0 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
